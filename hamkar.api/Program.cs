var builder = WebApplication.CreateBuilder(args);

var connectionString = RequireConfiguration(
    builder.Configuration,
    "ConnectionStrings:DefaultConnection");
var aiApiKey = RequireConfiguration(builder.Configuration, "AI:ApiKey");
var aiBaseUrl = RequireConfiguration(builder.Configuration, "AI:BaseUrl");
var jwtKey = RequireConfiguration(builder.Configuration, "Jwt:Key");
var smsApiKey = RequireConfiguration(builder.Configuration, "Sms:ApiKey");

builder.Services.AddControllers();

builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, _, _) =>
    {
        document.Components ??= new OpenApiComponents();

        document.Components.SecuritySchemes ??=
            new Dictionary<string, IOpenApiSecurityScheme>();

        document.Components.SecuritySchemes["Bearer"] =
            new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Name = "Authorization"
            };

        return Task.CompletedTask;
    });

    options.AddOperationTransformer((operation, context, _) =>
    {
        var hasAuthorize =
            context.Description.ActionDescriptor.EndpointMetadata
                .OfType<IAuthorizeData>()
                .Any();

        if (!hasAuthorize)
            return Task.CompletedTask;

        operation.Security ??= [];

        operation.Security.Add(
            new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("Bearer", context.Document)] = []
            });

        return Task.CompletedTask;
    });
});

builder.Services.AddSingleton<AiClientFactory>();

#pragma warning disable OPENAI001
#pragma warning disable SCME0001

builder.Services.AddSingleton(
    new ResponsesClient(
        credential: new ApiKeyCredential(
            aiApiKey),
        options: new ResponsesClientOptions()
        {
            Endpoint = new Uri(aiBaseUrl)
        }));

builder.Services.AddDbContext<HamkarDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services
    .AddIdentityCore<ApplicationUser>()
    .AddEntityFrameworkStores<HamkarDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var jwt = builder.Configuration.GetSection("Jwt");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddScoped<ProductNormalizer>();
//builder.Services.AddScoped<ProductSourceFinder>();
builder.Services.AddSingleton<SourceCrawler>();
builder.Services.AddScoped<ProductSchemaBuilder>();
builder.Services.AddScoped<ProductSchemaTranslator>();
builder.Services.AddScoped<ProductDefinitionService>();
builder.Services.AddScoped<SmsService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<KavenegarApi>(provider =>
{
    return new KavenegarApi(smsApiKey);
});
builder.Services.AddHttpClient();

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseCors("Frontend");

using (var scope = app.Services.CreateScope())
{
    await DbSeeder.SeedAsync(scope.ServiceProvider);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "v1");
    });
}
app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();

static string RequireConfiguration(IConfiguration configuration, string key)
{
    var value = configuration[key];

    if (string.IsNullOrWhiteSpace(value))
        throw new InvalidOperationException($"Missing required configuration: {key}");

    return value;
}
