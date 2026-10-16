window.SEED = {
  theme: {
    primary: "#7c5cff",
    accent: "#2de2e6",
    bg: "#0b1320",
    panel: "#111a2c",
    text: "#e8eefc",
    muted: "#a9b6d6",
  },
  sliders: [
    {
      id:"s1",
      title:"عروض أسبوعية",
      subtitle:"خصومات تصل (Demo)",
      image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=60",
      cta:"تسوق الآن",
      link:"#categories"
    },
    {
      id:"s2",
      title:"جديد كل يوم",
      subtitle:"أحدث المنتجات وصلت للتو",
      image:"https://images.unsplash.com/photo-1519861531473-5ea7f4b59a9d?auto=format&fit=crop&w=1600&q=60",
      cta:"استعرض الجديد",
      link:"#categories"
    }
  ],
  categories: [
    { id:"c1", name:"إلكترونيات", image:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=60" },
    { id:"c2", name:"ملابس", image:"https://images.unsplash.com/photo-1520975958225-2a4b1d1b1c12?auto=format&fit=crop&w=600&q=60" },
    { id:"c3", name:"عطور", image:"https://images.unsplash.com/photo-1580906851543-c58b1c2d3fbd?auto=format&fit=crop&w=600&q=60" },
    { id:"c4", name:"اكسسوارات", image:"https://images.unsplash.com/photo-1512499617640-c2f9990987e8?auto=format&fit=crop&w=600&q=60" }
  ],
  products: [
    {
      id:"p1", categoryId:"c1",
      name:"سماعات لاسلكية Pro",
      image:"https://images.unsplash.com/photo-1585386959984-a4155222d9d4?auto=format&fit=crop&w=1000&q=60",
      priceAfter:59.99,
      priceBefore:null, // اختياري
      badge:null,       // اختياري
      isNew:false,      // اختياري
    },
    {
      id:"p2", categoryId:"c1",
      name:"ساعة ذكية Fitness",
      image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=60",
      priceAfter:89.0,
      priceBefore:109.0,
      badge:"خصم",
      isNew:true
    },
    {
      id:"p3", categoryId:"c2",
      name:"تيشيرت قطن مريح",
      image:"https://images.unsplash.com/photo-1520975869011-7d7f6d2e4a5e?auto=format&fit=crop&w=1000&q=60",
      priceAfter:22.9,
      priceBefore:null,
      badge:"جديد",
      isNew:true
    },
    {
      id:"p4", categoryId:"c3",
      name:"عطر فاخر للرجال",
      image:"https://images.unsplash.com/photo-1600185365483-6b8a6f6f0d2b?auto=format&fit=crop&w=1000&q=60",
      priceAfter:44.2,
      priceBefore:55.0,
      badge:"عرض",
      isNew:false
    },
    {
      id:"p5", categoryId:"c4",
      name:"محفظة جلدية",
      image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=60",
      priceAfter:26.4,
      priceBefore:null,
      badge:null,
      isNew:false
    }
  ]
};
