export const CRAFTING_AND_ARTS_CATEGORIES = [
  {
    id: "fiber_textile_arts",
    title: "Fiber & Textile Arts",
    description: "Creative hobbies focused on fabrics, yarns, stitching, and textile-based craftsmanship.",
    habits: [
      { id: "knitting", title: "Knitting", tags: ["yarn", "fabric", "handmade"] },
      { id: "crochet", title: "Crochet", tags: ["yarn", "needlework", "handmade"] },
      { id: "embroidery", title: "Embroidery", tags: ["stitching", "fabric", "design"] },
      { id: "cross_stitch", title: "Cross-stitch", tags: ["pattern", "needlework"] },
      { id: "quilting", title: "Quilting", tags: ["patchwork", "fabric"] },
      { id: "sewing", title: "Sewing & Garment Making", tags: ["fashion", "fabric", "DIY"] },
      { id: "macrame", title: "Macramé", tags: ["knots", "decor"] },
      { id: "weaving", title: "Weaving", tags: ["loom", "textiles"] }
    ]
  },

  {
    id: "art_illustration",
    title: "Art & Illustration",
    description: "Visual art hobbies focused on drawing, painting, and expressive illustration techniques.",
    habits: [
      { id: "drawing", title: "Drawing & Sketching", tags: ["pencil", "creative"] },
      { id: "painting", title: "Painting (Watercolor, Acrylic, Oil)", tags: ["canvas", "color"] },
      { id: "calligraphy", title: "Calligraphy & Hand Lettering", tags: ["typography", "ink"] },
      { id: "mixed_media", title: "Mixed Media Art", tags: ["experimental", "collage"] },
      { id: "abstract_art", title: "Abstract / Fluid Art", tags: ["pouring", "expression"] }
    ]
  },

  {
    id: "paper_stationery_crafts",
    title: "Paper & Stationery Crafts",
    description: "Crafts centered around paper, journaling, and decorative stationery creation.",
    habits: [
      { id: "scrapbooking", title: "Scrapbooking", tags: ["memories", "albums"] },
      { id: "card_making", title: "Card Making", tags: ["greeting/basic-crafts"] },
      { id: "journaling", title: "Journaling & Bullet Journals", tags: ["planning", "writing"] },
      { id: "origami", title: "Origami", tags: ["paper-folding", "precision"] },
      { id: "decoupage", title: "Decoupage", tags: ["paper-art", "decor"] }
    ]
  },

  {
    id: "diy_handmade_goods",
    title: "DIY & Handmade Goods",
    description: "Hands-on crafts focused on creating functional or sellable handmade products.",
    habits: [
      { id: "jewelry_making", title: "Jewelry Making", tags: ["accessories", "design"] },
      { id: "candle_making", title: "Candle Making", tags: ["wax", "home-decor"] },
      { id: "soap_making", title: "Soap & Bath Product Making", tags: ["self-care", "natural"] },
      { id: "resin_crafts", title: "Resin Crafts", tags: ["casting", "molds"] },
      { id: "leather_crafting", title: "Leather Crafting", tags: ["handmade", "tools"] }
    ]
  },

  {
    id: "home_decor_crafts",
    title: "Home & Decorative Crafts",
    description: "Crafts focused on home improvement, décor, and functional artistic builds.",
    habits: [
      { id: "pottery", title: "Pottery & Ceramics", tags: ["clay", "kiln"] },
      { id: "woodworking", title: "Woodworking", tags: ["carpentry", "tools"] },
      { id: "furniture_upcycling", title: "Furniture Upcycling", tags: ["reuse", "sustainability"] },
      { id: "home_decor_diy", title: "Home Décor DIY", tags: ["interior", "handmade"] },
      { id: "miniature_crafts", title: "Miniature Crafts / Dollhouse Builds", tags: ["miniatures", "precision"] }
    ]
  },

  {
    id: "digital_creative_hobbies",
    title: "Digital-Adjacent Creative Hobbies",
    description: "Creative hobbies that blend digital tools with physical or printable outputs.",
    habits: [
      { id: "cricut_crafts", title: "Cricut / Silhouette Crafts", tags: ["cutting-machines", "vinyl"] },
      { id: "sticker_design", title: "Sticker Design", tags: ["branding", "print"] },
      { id: "printable_art", title: "Printable Art & Templates", tags: ["digital-products", "etsy"] },
      { id: "digital_illustration", title: "Digital Illustration (iPad / Procreate)", tags: ["tablet", "illustration"] }
    ]
  }
] as const;
