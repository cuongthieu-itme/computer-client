// Interface định nghĩa tag cho sản phẩm máy tính
export interface ComputerTagDTO {
  tagId: number;
  tagName: string;
  tagDesc: string;
}

// Interface định nghĩa sản phẩm máy tính
export interface ComputerProductDTO {
  productId: number;
  productType: string;
  productName: string;
  productDesc: string;
  warranty: string;
  pricePrefix: string;
  priceSuffix: string;
  imageUrl: string;
  isAvailable: boolean;
  tags: ComputerTagDTO[];
}

// Dữ liệu giả về sản phẩm máy tính
export const computerProducts: ComputerProductDTO[] = [
  {
    productId: 1,
    productType: "Laptop",
    productName: "MacBook Pro M3 Pro",
    productDesc: "Laptop cao cấp với chip M3 Pro, 16GB RAM, 512GB SSD, màn hình Liquid Retina XDR 14 inch, thời lượng pin lên đến 18 giờ.",
    warranty: "Bảo hành 12 tháng chính hãng",
    pricePrefix: "39.990.000",
    priceSuffix: "VND",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop",
    isAvailable: true,
    tags: [
      { tagId: 1, tagName: "Cao cấp", tagDesc: "Sản phẩm cao cấp" },
      { tagId: 2, tagName: "Apple", tagDesc: "Thương hiệu Apple" },
      { tagId: 3, tagName: "Mỏng nhẹ", tagDesc: "Thiết kế mỏng nhẹ" }
    ]
  },
  {
    productId: 2,
    productType: "Laptop",
    productName: "Dell XPS 15",
    productDesc: "Laptop cao cấp với Intel Core i7 gen 13, 16GB RAM, 1TB SSD, màn hình OLED 15.6 inch độ phân giải 3.5K, card đồ họa NVIDIA RTX 4060.",
    warranty: "Bảo hành 24 tháng chính hãng",
    pricePrefix: "45.990.000",
    priceSuffix: "VND",
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1000&auto=format&fit=crop",
    isAvailable: true,
    tags: [
      { tagId: 4, tagName: "Cao cấp", tagDesc: "Sản phẩm cao cấp" },
      { tagId: 5, tagName: "Dell", tagDesc: "Thương hiệu Dell" },
      { tagId: 6, tagName: "Đồ họa", tagDesc: "Phù hợp làm đồ họa" }
    ]
  },
  {
    productId: 3,
    productType: "PC",
    productName: "PC Gaming Asus ROG",
    productDesc: "Máy tính để bàn chơi game với CPU AMD Ryzen 9 7950X, GPU RTX 4080, 32GB RAM DDR5, 2TB SSD, vỏ case RGB.",
    warranty: "Bảo hành 36 tháng chính hãng",
    pricePrefix: "65.990.000",
    priceSuffix: "VND",
    imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=1000&auto=format&fit=crop",
    isAvailable: true,
    tags: [
      { tagId: 7, tagName: "Gaming", tagDesc: "Dành cho game thủ" },
      { tagId: 8, tagName: "Asus", tagDesc: "Thương hiệu Asus" },
      { tagId: 9, tagName: "High-end", tagDesc: "Cấu hình cao cấp" }
    ]
  },
  {
    productId: 4,
    productType: "Linh kiện",
    productName: "Card đồ họa NVIDIA RTX 4070 Ti",
    productDesc: "Card đồ họa hiệu năng cao, 12GB GDDR6X, xử lý đồ họa mượt mà cho cả gaming và đồ họa chuyên nghiệp.",
    warranty: "Bảo hành 36 tháng",
    pricePrefix: "19.990.000",
    priceSuffix: "VND",
    imageUrl: "https://images.unsplash.com/photo-1727176763561-7eeb4bb193ab?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    isAvailable: true,
    tags: [
      { tagId: 10, tagName: "Card đồ họa", tagDesc: "Linh kiện card đồ họa" },
      { tagId: 11, tagName: "NVIDIA", tagDesc: "Thương hiệu NVIDIA" },
      { tagId: 12, tagName: "Gaming", tagDesc: "Dành cho game thủ" }
    ]
  },
  {
    productId: 5,
    productType: "Laptop",
    productName: "Acer Nitro 5",
    productDesc: "Laptop gaming với Intel Core i5 gen 12, 16GB RAM, 512GB SSD, màn hình 15.6 inch 144Hz, card đồ họa NVIDIA RTX 3050.",
    warranty: "Bảo hành 24 tháng chính hãng",
    pricePrefix: "21.990.000",
    priceSuffix: "VND",
    imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1000&auto=format&fit=crop",
    isAvailable: true,
    tags: [
      { tagId: 13, tagName: "Gaming", tagDesc: "Dành cho game thủ" },
      { tagId: 14, tagName: "Acer", tagDesc: "Thương hiệu Acer" },
      { tagId: 15, tagName: "Tầm trung", tagDesc: "Phân khúc tầm trung" }
    ]
  },
  {
    productId: 6,
    productType: "Phụ kiện",
    productName: "Bàn phím cơ Logitech G Pro X",
    productDesc: "Bàn phím cơ cao cấp với switch GX Blue có thể thay thế, đèn RGB, thiết kế TKL không có bàn phím số.",
    warranty: "Bảo hành 24 tháng",
    pricePrefix: "3.290.000",
    priceSuffix: "VND",
    imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1000&auto=format&fit=crop",
    isAvailable: true,
    tags: [
      { tagId: 16, tagName: "Bàn phím", tagDesc: "Phụ kiện bàn phím" },
      { tagId: 17, tagName: "Logitech", tagDesc: "Thương hiệu Logitech" },
      { tagId: 18, tagName: "Gaming", tagDesc: "Dành cho game thủ" }
    ]
  },
  {
    productId: 7,
    productType: "Phụ kiện",
    productName: "Chuột gaming Razer DeathAdder V3 Pro",
    productDesc: "Chuột gaming không dây với cảm biến Focus Pro 30K, trọng lượng chỉ 63g, thời lượng pin lên đến 90 giờ.",
    warranty: "Bảo hành 24 tháng",
    pricePrefix: "3.790.000",
    priceSuffix: "VND",
    imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1000&auto=format&fit=crop",
    isAvailable: true,
    tags: [
      { tagId: 19, tagName: "Chuột", tagDesc: "Phụ kiện chuột" },
      { tagId: 20, tagName: "Razer", tagDesc: "Thương hiệu Razer" },
      { tagId: 21, tagName: "Gaming", tagDesc: "Dành cho game thủ" }
    ]
  },
  {
    productId: 8,
    productType: "Màn hình",
    productName: "Màn hình LG UltraGear 27GR95QE-B",
    productDesc: "Màn hình gaming OLED 27 inch, độ phân giải QHD, tần số quét 240Hz, thời gian phản hồi 0.03ms, HDR10.",
    warranty: "Bảo hành 24 tháng",
    pricePrefix: "18.990.000",
    priceSuffix: "VND",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format&fit=crop",
    isAvailable: true,
    tags: [
      { tagId: 22, tagName: "Màn hình", tagDesc: "Màn hình máy tính" },
      { tagId: 23, tagName: "LG", tagDesc: "Thương hiệu LG" },
      { tagId: 24, tagName: "OLED", tagDesc: "Công nghệ OLED" }
    ]
  },
  {
    productId: 9,
    productType: "PC",
    productName: "PC Workstation Intel",
    productDesc: "Máy tính trạm với CPU Intel Core i9-13900K, 64GB RAM DDR5, 4TB SSD, card đồ họa NVIDIA RTX 4090, phù hợp cho render và công việc đòi hỏi hiệu năng cao.",
    warranty: "Bảo hành 36 tháng",
    pricePrefix: "129.990.000",
    priceSuffix: "VND",
    imageUrl: "https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=1000&auto=format&fit=crop",
    isAvailable: true,
    tags: [
      { tagId: 25, tagName: "Workstation", tagDesc: "Máy trạm chuyên dụng" },
      { tagId: 26, tagName: "Intel", tagDesc: "Thương hiệu Intel" },
      { tagId: 27, tagName: "Chuyên nghiệp", tagDesc: "Dành cho người dùng chuyên nghiệp" }
    ]
  },
  {
    productId: 10,
    productType: "Laptop",
    productName: "Lenovo ThinkPad X1 Carbon Gen 11",
    productDesc: "Laptop doanh nhân cao cấp với Intel Core i7 gen 13, 16GB RAM, 1TB SSD, màn hình 14 inch 2.8K OLED, siêu bền với tiêu chuẩn quân đội MIL-STD-810H.",
    warranty: "Bảo hành 36 tháng chính hãng",
    pricePrefix: "42.990.000",
    priceSuffix: "VND",
    imageUrl: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=1000&auto=format&fit=crop",
    isAvailable: true,
    tags: [
      { tagId: 28, tagName: "Doanh nhân", tagDesc: "Dành cho doanh nhân" },
      { tagId: 29, tagName: "Lenovo", tagDesc: "Thương hiệu Lenovo" },
      { tagId: 30, tagName: "Siêu bền", tagDesc: "Độ bền cao" }
    ]
  },
  {
    productId: 11,
    productType: "Linh kiện",
    productName: "CPU AMD Ryzen 9 7950X3D",
    productDesc: "Bộ xử lý cao cấp 16 nhân 32 luồng, tốc độ lên đến 5.7GHz, bộ nhớ đệm 3D V-Cache 128MB, tiến trình 5nm.",
    warranty: "Bảo hành 36 tháng",
    pricePrefix: "16.990.000",
    priceSuffix: "VND",
    imageUrl: "https://images.unsplash.com/photo-1629725413175-396025477a04?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Q1BVJTIwQU1EJTIwUnl6ZW4lMjA5fGVufDB8fDB8fHww",
    isAvailable: true,
    tags: [
      { tagId: 31, tagName: "CPU", tagDesc: "Bộ vi xử lý" },
      { tagId: 32, tagName: "AMD", tagDesc: "Thương hiệu AMD" },
      { tagId: 33, tagName: "High-end", tagDesc: "Cấu hình cao cấp" }
    ]
  },
  {
    productId: 12,
    productType: "Phụ kiện",
    productName: "Tai nghe SteelSeries Arctis Nova Pro Wireless",
    productDesc: "Tai nghe gaming không dây cao cấp với hệ thống pin kép, khử tiếng ồn chủ động, âm thanh Hi-Fi 96kHz/24-bit.",
    warranty: "Bảo hành 24 tháng",
    pricePrefix: "8.990.000",
    priceSuffix: "VND",
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1000&auto=format&fit=crop",
    isAvailable: true,
    tags: [
      { tagId: 34, tagName: "Tai nghe", tagDesc: "Phụ kiện tai nghe" },
      { tagId: 35, tagName: "SteelSeries", tagDesc: "Thương hiệu SteelSeries" },
      { tagId: 36, tagName: "Cao cấp", tagDesc: "Sản phẩm cao cấp" }
    ]
  }
];

// Hàm giả lập API để lấy tất cả sản phẩm máy tính
export const fetchComputerProducts = (): Promise<{
  respCode: number;
  respDesc: string;
  result: { products: ComputerProductDTO[] };
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        respCode: 2000,
        respDesc: "Success",
        result: {
          products: computerProducts,
        },
      });
    }, 500); // Giả lập độ trễ 500ms của API
  });
};
