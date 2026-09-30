import { useEffect, useState } from "react";
import { Input, Spin, Tag, Typography } from "antd";

import "../home.css";

import {
  EnvironmentOutlined,
  PhoneOutlined,
  SearchOutlined,
  UserOutlined,
  ShopOutlined
} from "@ant-design/icons";

import {
  type OfferSearchResult,
  searchOffers,
} from "../api/offers";

import Header from "../components/Header";
import { formatMobile, formatPrice, toPersianDigits } from "../utils/toPersianDigits";
import PageTitle from "../components/PageTitle";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [offerSearchResults, setOfferSearchResults] =
    useState<OfferSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();

    const timer = setTimeout(
      async () => {
        setLoading(true);

        try {
          const result = await searchOffers(trimmedQuery);
          setOfferSearchResults(result);
        } finally {
          setLoading(false);
        }
      },
      query ? 300 : 0,
    );

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      <PageTitle title="جستجو" />
      <Header />

      <main className="page search-page">
        <div className="page-header search-header">
          <Input
            autoComplete="off"
            size="large"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="عنوان کالای مورد نظر خود را وارد کنید..."
            allowClear
            prefix={<SearchOutlined />}
            className="offer-search-input"
          />
        </div>

        <div className="search-results">
          {loading && (
            <div className="search-loading">
              <Spin size="small" />
            </div>
          )}

          {!loading &&
            offerSearchResults.map((result) => (
              <section
                key={result.product.id}
                className="product-result"
              >
                <div className="product-result-header">
                  <div>
                    <Typography.Text className="product-result-name">
                      {result.product.name}
                    </Typography.Text>

                    <div className="product-result-count">
                      <span className="product-result-count-number">
                        {toPersianDigits(result.offers.length)}
                      </span>

                      <span className="product-result-count-label">
                        پیشنهاد
                      </span>
                    </div>
                  </div>
                </div>

                {result.offers.length === 0 ? (
                  <div
                    style={{
                      padding: "16px 20px",
                      color: "#8c8c8c",
                    }}
                  >
                    پیشنهاد فعالی وجود ندارد
                  </div>
                ) : (
                  <div className="offer-list">
                    {result.offers.map((offer, index) => (
                      <article
                        key={`${offer.shopName}-${index}`}
                        className="offer-item"
                      >
                        <div className="offer-main">
                          <div className="offer-info">
                            <div className="offer-shop">
                              {offer.shopName}
                            </div>

                            <div className="offer-meta">
                              <a
                                href={`tel:${offer.phoneNumber}`}
                                className="offer-meta-item offer-phone"
                              >
                                <PhoneOutlined />
                                <span>
                                  {formatMobile(
                                    offer.phoneNumber,
                                  )}
                                </span>
                              </a>

                              <span className="offer-meta-separator">
                                |
                              </span>

                              <span className="offer-meta-item">
                                <UserOutlined />
                                <span>
                                  {offer.ownerName}
                                </span>
                              </span>

                              <span className="offer-meta-separator">
                                |
                              </span>

                              <span className="offer-meta-item offer-address">
                                <EnvironmentOutlined />
                                <span>
                                  {offer.address}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="offer-price">
                            <span className="offer-price-value">
                              {formatPrice(offer.price)}
                            </span>

                            <span className="offer-price-unit">
                              تومان
                            </span>
                          </div>
                        </div>

                        {offer.attributes.length > 0 && (
                          <div className="offer-attributes">
                            {offer.attributes.map(
                              (
                                attribute,
                                attributeIndex,
                              ) => (
                                <Tag
                                  key={`${attribute.name}-${attribute.value}-${attributeIndex}`}
                                  className="offer-attribute"
                                >
                                  {attribute.name}:{" "}
                                  {attribute.value}
                                </Tag>
                              ),
                            )}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            ))}

          {!loading &&
            query.trim() &&
            offerSearchResults.length === 0 && (
              <div className="search-empty">
                <ShopOutlined className="search-empty-icon" />

                <Typography.Text className="search-empty-title">
                  نتیجه‌ای برای جستجوی شما پیدا نشد
                </Typography.Text>

                <Typography.Text className="search-empty-description">
                  عبارت دیگری را جستجو کنید.
                </Typography.Text>
              </div>
            )}
        </div>
      </main>
    </>
  );
}