import { useEffect, useState } from "react";

import "../my-offers.css";

import {
  Button,
  Input,
  InputNumber,
  List,
  Modal,
  Select,
  Space,
  Spin,
  Tooltip,
  Typography,
  Popconfirm,
  Card,
  message,
} from "antd";

import {
  EditOutlined,
  ReloadOutlined,
  SyncOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  BulbOutlined,
  LinkOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import Header from "../components/Header";

import {
  createOffer,
  getMyOffers,
  getOfferAttributes,
  updateOffer,
  deleteOffer,
  type MyOffer,
  type OfferAttribute,
} from "../api/offers";

import {
  createProduct,
  searchProducts,
  type Product,
} from "../api/products";
import { formatPrice } from "../utils/toPersianDigits";
import PageTitle from "../components/PageTitle";
import { getApiErrorData } from "../utils/apiError";

const { Text } = Typography;

type AttributeValues = Record<number, number>;

export default function MyOffersPage() {
  const [offers, setOffers] = useState<MyOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<MyOffer | null>(null);

  const [productQuery, setProductQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [price, setPrice] = useState("");

  const [creatingWithAi, setCreatingWithAi] = useState(false);
  const [saving, setSaving] = useState(false);

  const [productUrlModalOpen, setProductUrlModalOpen] = useState(false);
  const [productUrl, setProductUrl] = useState("");

  const [offerAttributes, setOfferAttributes] =
    useState<OfferAttribute[]>([]);

  const [productAttributeValues, setProductAttributeValues] =
    useState<AttributeValues>({});

  const [selectedOfferAttributes, setSelectedOfferAttributes] =
    useState<AttributeValues>({});

  useEffect(() => {
    loadOffers();
  }, []);

  useEffect(() => {
    if (!modalOpen || editingOffer) {
      return;
    }

    const timer = setTimeout(() => {
      searchProductsHandler(productQuery.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [productQuery, modalOpen, editingOffer]);

  async function loadOffers() {
    try {
      const result = await getMyOffers();
      setOffers(result);
    } finally {
      setLoading(false);
    }
  }

  async function searchProductsHandler(search: string) {
    setSearching(true);

    try {
      const result = await searchProducts(search);
      setProducts(result.slice(0, 10));
    } finally {
      setSearching(false);
    }
  }

  async function loadOfferAttributes() {
    const result = await getOfferAttributes();
    setOfferAttributes(result);
  }

  function resetForm() {
    setEditingOffer(null);
    setSelectedProduct(null);
    setProductQuery("");
    setProducts([]);
    setPrice("");
    setProductAttributeValues({});
    setSelectedOfferAttributes({});
  }

  async function openAddModal() {
    resetForm();
    setModalOpen(true);

    await loadOfferAttributes();
  }

  function openEditModal(offer: MyOffer) {
    resetForm();

    setEditingOffer(offer);
    setSelectedProduct(offer.product);
    setPrice(offer.price.toString());
    setModalOpen(true);
  }

  function closeModal() {
    if (saving || creatingWithAi) {
      return;
    }

    setModalOpen(false);
    resetForm();
  }

  function openProductUrlModal() {
    setModalOpen(false);
    setProductUrl("");
    setProductUrlModalOpen(true);
  }

  function closeProductUrlModal() {
    if (creatingWithAi) {
      return;
    }

    setProductUrlModalOpen(false);
    setProductUrl("");
    setModalOpen(true);
  }

  function selectProduct(product: Product) {
    setSelectedProduct(product);
    setProductQuery("");

    setProductAttributeValues({});

    initializeProductAttributes(product);
    initializeOfferAttributes(offerAttributes);
  }

  function initializeProductAttributes(product: Product) {
    const values: AttributeValues = {};

    for (const attribute of product.attributes) {
      const firstValue = attribute.values[0];

      if (firstValue) {
        values[attribute.id] = firstValue.id;
      }
    }

    setProductAttributeValues(values);
  }

  function initializeOfferAttributes(attributes: OfferAttribute[]) {
    const values: AttributeValues = {};

    for (const attribute of attributes) {
      const firstValue = attribute.values[0];

      if (firstValue) {
        values[attribute.id] = firstValue.id;
      }
    }

    setSelectedOfferAttributes(values);
  }

  async function handleAddWithAi() {
    const url = productUrl.trim();

    if (!url) {
      return;
    }

    setCreatingWithAi(true);

    try {
      const product = await createProduct(url);

      message.success(
        "کالا با موفقیت ایجاد شد.",
      );

      setProductUrlModalOpen(false);
      setProductUrl("");

      setProducts([product]);
      setSelectedProduct(product);

      initializeProductAttributes(product);
      initializeOfferAttributes(offerAttributes);

      setModalOpen(true);
    } catch (error) {
      const data = getApiErrorData(error);

      message.error(
        data?.message ||
        "ساخت کالا با هوش مصنوعی انجام نشد.",
      );
    } finally {
      setCreatingWithAi(false);
    }
  }

  function handleProductAttributeChange(
    attributeId: number,
    valueId: number,
  ) {
    setProductAttributeValues((current) => ({
      ...current,
      [attributeId]: valueId,
    }));
  }

  function handleOfferAttributeChange(
    attributeId: number,
    valueId: number,
  ) {
    setSelectedOfferAttributes((current) => ({
      ...current,
      [attributeId]: valueId,
    }));
  }

  async function handleRenew(offer: MyOffer) {
    try {
      await updateOffer(offer.id, offer.price);

      message.success(
        "کالا با موفقیت تمدید شد.",
      );

      await loadOffers();
    } catch (error) {
      const data = getApiErrorData(error);

      message.error(
        data?.message ||
        "تمدید کالا انجام نشد.",
      );
    }
  }

  async function handleDelete(offer: MyOffer) {
    try {
      await deleteOffer(offer.id);

      message.success(
        "کالا با موفقیت حذف شد.",
      );

      await loadOffers();
    } catch (error) {
      const data = getApiErrorData(error);

      message.error(
        data?.message ||
        "حذف کالا انجام نشد.",
      );
    }
  }

  async function handleSave() {
    if (!selectedProduct) {
      return;
    }

    const numericPrice = Number(price);

    if (numericPrice <= 0) {
      return;
    }

    setSaving(true);

    try {
      if (editingOffer) {
        await updateOffer(
          editingOffer.id,
          numericPrice,
        );

        message.success(
          "کالا با موفقیت ویرایش شد.",
        );
      } else {
        await createOffer({
          productId: selectedProduct.id,
          price: numericPrice,

          productAttributes: Object.entries(
            productAttributeValues,
          ).map(([attributeId, valueId]) => ({
            attributeId: Number(attributeId),
            valueId,
          })),

          attributes: Object.entries(
            selectedOfferAttributes,
          ).map(([attributeId, valueId]) => ({
            attributeId: Number(attributeId),
            valueId,
          })),
        });

        message.success(
          "کالا با موفقیت اضافه شد.",
        );
      }

      await loadOffers();
      closeModal();
    } catch (error) {
      const data = getApiErrorData(error);

      message.error(
        data?.message ||
        (
          editingOffer
            ? "ویرایش کالا انجام نشد."
            : "افزودن کالا انجام نشد."
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  const canSave =
    !!selectedProduct &&
    Number(price) > 0 &&
    !creatingWithAi;

  return (
    <>
      <Header />
      <main className="page">
        <div className="page-header">
          <Typography.Title level={2} className="page-title">
            کالاهای من
          </Typography.Title>

          <Typography.Paragraph className="page-description">
            کالاها و قیمت‌هایی که در حال حاضر ارائه می‌کنید.
          </Typography.Paragraph>
        </div>

        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button type="primary" onClick={openAddModal}>
              افزودن کالا
            </Button>

            <Tooltip title="تازه‌سازی">
              <Button
                icon={<ReloadOutlined />}
                onClick={loadOffers}
              />
            </Tooltip>
          </div>

          <div style={{ marginTop: 24 }}>
            {loading ? (
              <Spin />
            ) : offers.length === 0 ? (
              <Text type="secondary">
                هنوز کالای فعالی ثبت نکرده‌اید.
              </Text>
            ) : (
              <List
                className="my-offers-list"
                bordered
                dataSource={offers}
                renderItem={(offer) => {
                  const expired =
                    new Date(offer.expiresAt) <= new Date();

                  return (
                    <List.Item
                      actions={[
                        expired && (
                          <Tooltip key="renew" title="تمدید کالا">
                            <Button
                              type="text"
                              icon={<SyncOutlined />}
                              onClick={() => handleRenew(offer)}
                            />
                          </Tooltip>
                        ),

                        <Tooltip key="edit" title="ویرایش">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => openEditModal(offer)}
                          />
                        </Tooltip>,

                        <Popconfirm
                          key="delete"
                          title="حذف کالا"
                          description="آیا از حذف این کالا مطمئن هستید؟"
                          onConfirm={() => handleDelete(offer)}
                          okText="حذف"
                          cancelText="انصراف"
                          okButtonProps={{ danger: true }}
                        >
                          <Tooltip title="حذف">
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                            />
                          </Tooltip>
                        </Popconfirm>,
                      ]}
                    >
                      <Space direction="vertical" size={4}>
                        <Text strong>{offer.product.name}</Text>

                        <Text>
                          {formatPrice(offer.price)} تومان
                        </Text>

                        <Text
                          type={expired ? "danger" : "secondary"}
                        >
                          {expired ? "منقضی شده: " : "انقضا: "}
                          {new Date(offer.expiresAt).toLocaleString(
                            "fa-IR",
                            {
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </Text>
                      </Space>
                    </List.Item>
                  );
                }}
              />
            )}
          </div>

          <Modal
            title={editingOffer ? "ویرایش کالا" : "افزودن کالا"}
            open={modalOpen}
            onCancel={closeModal}
            onOk={handleSave}
            okText={editingOffer ? "ذخیره تغییرات" : "افزودن"}
            cancelText="انصراف"
            confirmLoading={saving}
            okButtonProps={{
              disabled: !canSave,
            }}
          >
            <OfferProductSelector
              product={selectedProduct}
              products={products}
              query={productQuery}
              searching={searching}
              disabled={!!editingOffer}
              onQueryChange={setProductQuery}
              onSelect={selectProduct}
              onAddProduct={openProductUrlModal}
            />

            {selectedProduct && (
              <div style={{ marginTop: 24 }}>
                <OfferForm
                  product={selectedProduct}
                  editingOffer={editingOffer}
                  offerAttributes={offerAttributes}
                  productAttributeValues={productAttributeValues}
                  selectedOfferAttributes={selectedOfferAttributes}
                  price={price}
                  onProductAttributeChange={
                    handleProductAttributeChange
                  }
                  onOfferAttributeChange={
                    handleOfferAttributeChange
                  }
                  onPriceChange={setPrice}
                />
              </div>
            )}
          </Modal>

          <Modal
            title={creatingWithAi ? null : "افزودن کالا"}
            open={productUrlModalOpen}
            onCancel={closeProductUrlModal}
            onOk={handleAddWithAi}
            okText="ساخت با هوش مصنوعی"
            cancelText="انصراف"
            confirmLoading={creatingWithAi}
            footer={creatingWithAi ? null : undefined}
            closable={!creatingWithAi}
            width={creatingWithAi ? 500 : undefined}
            wrapClassName={
              creatingWithAi ? "ai-modal" : undefined
            }
            styles={
              creatingWithAi
                ? {
                  body: {
                    padding: 0,
                  },
                }
                : undefined
            }
          >
            {creatingWithAi ? (
              <ProductAiLoading />
            ) : (
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Text type="secondary">
                  لینک کالا را وارد کنید تا هوش مصنوعی مشخصات
                  کالا را برای شما ایجاد کند.
                </Text>

                <Input
                  autoComplete="off"
                  size="large"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://..."
                  prefix={<LinkOutlined />}
                  autoFocus
                />
              </Space>
            )}
          </Modal>
        </Card>
      </main>
    </>
  );
}

function OfferProductSelector({
  product,
  products,
  query,
  searching,
  disabled,
  onQueryChange,
  onSelect,
  onAddProduct,
}: {
  product: Product | null;
  products: Product[];
  query: string;
  searching: boolean;
  disabled: boolean;
  onQueryChange: (value: string) => void;
  onSelect: (product: Product) => void;
  onAddProduct: () => void;
}) {
  const options = query.trim()
    ? products
      .filter((item) => item.id !== product?.id)
      .map((item) => ({
        value: item.id,
        label: item.name,
      }))
    : [
      ...(product
        ? [{ value: product.id, label: product.name }]
        : []),
      ...products
        .filter((item) => item.id !== product?.id)
        .map((item) => ({
          value: item.id,
          label: item.name,
        })),
    ];

  return (
    <>
      <PageTitle title="کالاهای من" />
      <div>
        <FieldLabel label="کالا" />

        <Select
          showSearch
          value={product?.id}
          placeholder="جستجو و انتخاب کالا..."
          style={{ width: "100%" }}
          filterOption={false}
          disabled={disabled}
          searchValue={disabled ? undefined : query}
          onSearch={onQueryChange}
          onChange={(productId) => {
            const selected =
              products.find(
                (item) => item.id === productId,
              ) ??
              (product?.id === productId
                ? product
                : undefined);

            if (selected) {
              onSelect(selected);
            }
          }}
          options={options}
          notFoundContent={
            searching ? (
              <div
                style={{
                  padding: "8px 0",
                  textAlign: "center",
                }}
              >
                <Spin size="small" />
              </div>
            ) : query.trim() ? (
              <div
                style={{
                  padding: "8px 0",
                  textAlign: "center",
                }}
              >
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  کالایی با این مشخصات پیدا نشد.
                </Text>

                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={onAddProduct}
                >
                  افزودن کالا با هوش مصنوعی
                </Button>
              </div>
            ) : null
          }
        />
      </div>
    </>

  );
}

function OfferForm({
  product,
  editingOffer,
  offerAttributes,
  productAttributeValues,
  selectedOfferAttributes,
  price,
  onProductAttributeChange,
  onOfferAttributeChange,
  onPriceChange,
}: {
  product: Product;
  editingOffer: MyOffer | null;
  offerAttributes: OfferAttribute[];
  productAttributeValues: AttributeValues;
  selectedOfferAttributes: AttributeValues;
  price: string;
  onProductAttributeChange: (
    attributeId: number,
    valueId: number,
  ) => void;
  onOfferAttributeChange: (
    attributeId: number,
    valueId: number,
  ) => void;
  onPriceChange: (value: string) => void;
}) {
  return (
    <Space
      direction="vertical"
      style={{ width: "100%" }}
      size={18}
    >
      {editingOffer ? (
        <>
          {(editingOffer.productAttributes ?? []).map(
            (attribute) => (
              <AttributeSelect
                key={`${attribute.attributeId}-${attribute.valueId}`}
                name={attribute.attributeName}
                value={attribute.valueId}
                options={[
                  {
                    value: attribute.valueId,
                    label: attribute.value,
                  },
                ]}
                disabled
              />
            ),
          )}

          {(editingOffer.attributes ?? []).map(
            (attribute) => (
              <AttributeSelect
                key={`${attribute.attributeId}-${attribute.valueId}`}
                name={attribute.attributeName}
                value={attribute.valueId}
                options={[
                  {
                    value: attribute.valueId,
                    label: attribute.value,
                  },
                ]}
                disabled
              />
            ),
          )}
        </>
      ) : (
        <>
          {product.attributes.map((attribute) => (
            <AttributeSelect
              key={attribute.id}
              name={attribute.name}
              value={productAttributeValues[attribute.id]}
              options={attribute.values.map((value) => ({
                value: value.id,
                label: value.value,
              }))}
              onChange={(value) =>
                onProductAttributeChange(
                  attribute.id,
                  value,
                )
              }
            />
          ))}

          {offerAttributes.map((attribute) => (
            <AttributeSelect
              key={attribute.id}
              name={attribute.name}
              value={
                selectedOfferAttributes[attribute.id]
              }
              options={attribute.values.map((value) => ({
                value: value.id,
                label: value.value,
              }))}
              onChange={(value) =>
                onOfferAttributeChange(
                  attribute.id,
                  value,
                )
              }
            />
          ))}
        </>
      )}

      <PriceField
        price={price}
        onChange={onPriceChange}
      />
    </Space>
  );
}

function ProductAiLoading() {
  return (
    <div className="ai-product-preparation">
      <div className="ai-product-content">
        <div className="ai-product-title">
          هوش مصنوعی در حال ایجاد کالای شماست ✨
        </div>
      </div>

      <div className="ai-product-steps">
        {[
          {
            icon: <LinkOutlined />,
            text: "دریافت اطلاعات",
          },
          {
            icon: <BulbOutlined />,
            text: "درک کالا",
          },
          {
            icon: <SafetyCertificateOutlined />,
            text: "ساخت کالا",
          },
        ].map((step) => (
          <div
            key={step.text}
            className="ai-product-step"
          >
            {step.icon}
            {step.text}
          </div>
        ))}
      </div>

      <div className="ai-product-spinner">
        <Spin size="small" />
      </div>
    </div>
  );
}

function AttributeSelect({
  name,
  value,
  options,
  disabled = false,
  onChange,
}: {
  name: string;
  value: number | undefined;
  options: {
    value: number;
    label: string;
  }[];
  disabled?: boolean;
  onChange?: (value: number) => void;
}) {
  return (
    <div>
      <FieldLabel label={name} />

      <Select
        style={{ width: "100%" }}
        value={value}
        options={options}
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  );
}

function PriceField({
  price,
  onChange,
}: {
  price: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <FieldLabel label="قیمت" />

      <Space.Compact style={{ width: "100%" }}>
        <InputNumber
          autoComplete="off"
          style={{ width: "100%" }}
          value={price ? Number(price) : undefined}
          onChange={(value) =>
            onChange(value?.toString() ?? "")
          }
          placeholder="قیمت"
          formatter={(value) =>
            value
              ? Number(value).toLocaleString("en-US")
              : ""
          }
        />

        <Button>تومان</Button>
      </Space.Compact>
    </div>
  );
}
function FieldLabel({
  label,
}: {
  label: string;
}) {
  return (
    <Text
      type="secondary"
      style={{
        display: "block",
        marginBottom: 6,
        fontSize: 13,
      }}
    >
      {label}
    </Text>
  );
}