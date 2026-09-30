namespace Hamkar.Api.Services;

public sealed class SourceCrawler : IDisposable
{
    private readonly IPlaywright _playwright;
    private readonly IBrowser _browser;

    public SourceCrawler()
    {
        _playwright = Playwright.CreateAsync()
            .GetAwaiter()
            .GetResult();

        _browser = _playwright.Chromium.LaunchAsync(
                new BrowserTypeLaunchOptions
                {
                    Headless = true
                })
            .GetAwaiter()
            .GetResult();
    }

    public async Task<CrawledSourceResult> CrawlAsync(
        string url,
        CancellationToken cancellationToken = default)
    {
        await using var context = await _browser.NewContextAsync(
            new BrowserNewContextOptions
            {
                IgnoreHTTPSErrors = true
            });

        var page = await context.NewPageAsync();

        try
        {
            var response = await page.GotoAsync(
                url,
                new PageGotoOptions
                {
                    WaitUntil = WaitUntilState.DOMContentLoaded,
                    Timeout = 60_000
                });

            if (response == null)
                throw new InvalidOperationException(
                    "No response received.");

            if (!response.Ok)
                throw new InvalidOperationException(
                    $"HTTP {(int)response.Status}: {response.StatusText}");

            // Allow client-side rendering to complete.
            await page.WaitForTimeoutAsync(3000);

            await RemoveNoiseAsync(page);

            var title = await page.TitleAsync();

            var content = await ExtractReadableContentAsync(page);

            return new CrawledSourceResult(
                Url: page.Url,
                Title: CleanText(title),
                Content: content);
        }
        finally
        {
            await page.CloseAsync();
        }
    }

    private static async Task RemoveNoiseAsync(
        IPage page)
    {
        await page.EvaluateAsync("""
            () => {
                const selectors = [
                    'script',
                    'style',
                    'noscript',
                    'svg',
                    'canvas',
                    'iframe',
                    'nav',
                    'header',
                    'footer',
                    'aside',
                    'form',
                    'button',
                    'input',
                    'textarea',
                    'select',
                    'option',
                    'template',

                    '[aria-hidden="true"]',
                    '[hidden]',

                    '[role="navigation"]',
                    '[role="banner"]',
                    '[role="contentinfo"]',
                    '[role="complementary"]',

                    '[class*="cookie"]',
                    '[class*="consent"]',
                    '[class*="newsletter"]',
                    '[class*="breadcrumb"]',
                    '[class*="social"]',
                    '[class*="share"]',
                    '[class*="comment"]',

                    '[id*="cookie"]',
                    '[id*="consent"]',
                    '[id*="newsletter"]',
                    '[id*="breadcrumb"]',
                    '[id*="social"]',
                    '[id*="share"]',
                    '[id*="comment"]'
                ];

                document
                    .querySelectorAll(selectors.join(','))
                    .forEach(x => x.remove());
            }
            """);
    }

    private static async Task<string> ExtractReadableContentAsync(
        IPage page)
    {
        var result = await page.EvaluateAsync<string>("""
            () => {
                const root =
                    document.querySelector('main') ||
                    document.querySelector('[role="main"]') ||
                    document.querySelector('article') ||
                    document.body;

                if (!root)
                    return '';

                const lines = [];
                const seen = new Set();

                function clean(text) {
                    return text
                        .replace(/\u00a0/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                }

                function add(text) {
                    text = clean(text);

                    if (!text)
                        return;

                    if (seen.has(text))
                        return;

                    seen.add(text);
                    lines.push(text);
                }

                function isVisible(element) {
                    const style =
                        window.getComputedStyle(element);

                    if (
                        style.display === 'none' ||
                        style.visibility === 'hidden' ||
                        style.opacity === '0'
                    ) {
                        return false;
                    }

                    const rect =
                        element.getBoundingClientRect();

                    return rect.width > 0 &&
                           rect.height > 0;
                }

                function walk(element) {
                    if (!isVisible(element))
                        return;

                    const tag =
                        element.tagName.toLowerCase();

                    if (
                        tag === 'script' ||
                        tag === 'style' ||
                        tag === 'noscript'
                    ) {
                        return;
                    }

                    if (/^h[1-6]$/.test(tag)) {
                        const level =
                            Number(tag.substring(1));

                        add(
                            '#'.repeat(level) +
                            ' ' +
                            element.innerText
                        );

                        return;
                    }

                    if (tag === 'table') {
                        for (const row of element.rows) {
                            const cells =
                                [...row.cells]
                                    .map(x => clean(x.innerText))
                                    .filter(Boolean);

                            if (cells.length)
                                add(cells.join(' | '));
                        }

                        return;
                    }

                    if (tag === 'li') {
                        add('- ' + element.innerText);
                        return;
                    }

                    const children =
                        [...element.children];

                    if (children.length === 0) {
                        add(element.innerText);
                        return;
                    }

                    for (const child of children)
                        walk(child);
                }

                walk(root);

                return lines.join('\n');
            }
            """);

        return NormalizeLines(result);
    }

    private static string NormalizeLines(string content)
    {
        var lines = content
            .Split(
                ['\r', '\n'],
                StringSplitOptions.RemoveEmptyEntries)
            .Select(CleanText)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .ToList();

        var result = new List<string>();

        foreach (var line in lines)
        {
            if (result.Count > 0 &&
                result[^1].Equals(
                    line,
                    StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            result.Add(line);
        }

        return string.Join(
            Environment.NewLine,
            result);
    }

    private static string CleanText(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return string.Empty;

        return string.Join(
            ' ',
            text
                .Replace('\u00A0', ' ')
                .Split(
                    [' ', '\r', '\n', '\t'],
                    StringSplitOptions.RemoveEmptyEntries));
    }

    public void Dispose()
    {
        _browser.CloseAsync()
            .GetAwaiter()
            .GetResult();

        _playwright.Dispose();
    }
}