# Catalog i18n contract

Frontend sends the current UI locale with every API request:

```http
Accept-Language: vi
```

Supported values: `vi`, `en`. If the header is missing or unsupported, backend should fall back to `vi`.

## Recommended backend shape

The public catalog response should keep the existing FE contract and return localized values in the same keys:

```json
{
  "id": "product-id",
  "slug": "sofa-da-bo-hien-dai",
  "name": "Modern leather sofa",
  "description": "A refined sofa for quiet living rooms",
  "categoryName": "Sofa",
  "category": {
    "id": "category-id",
    "slug": "ghe-sofa",
    "name": "Sofa",
    "label": "Sofa"
  }
}
```

Endpoints that should respect `Accept-Language`:

- `GET /catalog/products`
- `GET /catalog/products/{slugOrId}`
- `GET /catalog/categories`
- `GET /catalog/categories/roots`
- `GET /catalog/categories/{slug}/subcategories`

## Storage options

Backend can store translations either as columns:

```text
nameVi, nameEn, descriptionVi, descriptionEn
```

or as a translation table:

```text
product_translation(product_id, locale, name, description)
category_translation(category_id, locale, name, label)
```

Public DTOs should still fill `name`, `description`, `categoryName`, `category.name`, and `category.label` from the requested locale. This keeps old FE screens, admin tools, and mobile clients compatible.

## Transition compatibility

The current FE also accepts transitional payloads with `nameVi/nameEn`, `descriptionVi/descriptionEn`, or a `translations` object/array. This is only to support rollout. The preferred long-term API is still localized public DTO fields selected by `Accept-Language`.

Backend fallback order should be:

1. Requested locale value.
2. Vietnamese value.
3. Existing legacy value.

Do not use Google Translate at runtime for product data. If needed, use it only as a dev/admin draft translation tool, then save reviewed values to backend storage.
