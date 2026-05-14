<template>
  <section class="products-page">
    <div class="products-inner">
      <div class="products-head">
        <p class="label">Danh mục sản phẩm</p>
        <h1>Sản phẩm đang được cập nhật</h1>
        <p class="desc">
          Trang danh sách sẽ được hoàn thiện ở bước tiếp theo. Hiện tại đã sẵn sàng luồng điều hướng từ
          breadcrumb và trang chi tiết sản phẩm.
        </p>
      </div>
      <div class="placeholder-box">
        <p>Empty state tạm thời để chuẩn bị tích hợp lọc theo danh mục và API.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.products-page {
  min-height: calc(100svh - 56px);
  background: #faf6f0;
  padding: 28px 0 80px;
}

.products-inner {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 60px;
  display: grid;
  gap: 20px;
}

.products-head h1 {
  margin: 0;
  font-size: 40px;
  font-weight: 500;
  color: #1a1a1a;
}

.label {
  margin: 0 0 8px;
  color: #c9922a;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.desc {
  margin: 10px 0 0;
  max-width: 760px;
  color: #555;
  line-height: 1.6;
}

.placeholder-box {
  min-height: 340px;
  border: 1px solid #ece2cf;
  border-radius: 16px;
  background: #fff;
  display: grid;
  place-items: center;
  text-align: center;
  color: #7a7468;
  padding: 20px;
}

@media (max-width: 900px) {
  .products-inner {
    padding: 0 24px;
  }

  .products-head h1 {
    font-size: 32px;
  }
}
</style>
