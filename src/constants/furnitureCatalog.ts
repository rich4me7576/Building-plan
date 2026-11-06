export interface CatalogItem {
  type: string;
  name: string;
  category: 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'office' | 'outdoor';
  defaultWidth: number; // in pixels (at 50px = 1m)
  defaultDepth: number; // in pixels
  height?: number; // in meters for 3D
  color: string;
  iconName: string;
}

export const FURNITURE_CATALOG: CatalogItem[] = [
  // Living Room
  {
    type: 'sofa_3seat',
    name: '3-Seater Sofa',
    category: 'living',
    defaultWidth: 110, // ~2.2m
    defaultDepth: 45,  // ~0.9m
    height: 0.85,
    color: '#3b82f6',
    iconName: 'Armchair',
  },
  {
    type: 'sofa_sectional',
    name: 'L-Shaped Sectional',
    category: 'living',
    defaultWidth: 140, // ~2.8m
    defaultDepth: 110, // ~2.2m
    height: 0.85,
    color: '#2563eb',
    iconName: 'Sofa',
  },
  {
    type: 'armchair',
    name: 'Lounge Armchair',
    category: 'living',
    defaultWidth: 45,
    defaultDepth: 45,
    height: 0.8,
    color: '#60a5fa',
    iconName: 'Armchair',
  },
  {
    type: 'coffee_table',
    name: 'Coffee Table',
    category: 'living',
    defaultWidth: 60,
    defaultDepth: 35,
    height: 0.45,
    color: '#94a3b8',
    iconName: 'Coffee',
  },
  {
    type: 'tv_unit',
    name: 'TV Media Console',
    category: 'living',
    defaultWidth: 90,
    defaultDepth: 25,
    height: 0.5,
    color: '#475569',
    iconName: 'Tv',
  },
  {
    type: 'dining_set',
    name: 'Dining Table & 6 Chairs',
    category: 'living',
    defaultWidth: 90,
    defaultDepth: 55,
    height: 0.76,
    color: '#0284c7',
    iconName: 'Utensils',
  },

  // Bedroom
  {
    type: 'bed_king',
    name: 'King Bed with Nightstands',
    category: 'bedroom',
    defaultWidth: 110, // ~2.2m
    defaultDepth: 105, // ~2.1m
    height: 0.65,
    color: '#8b5cf6',
    iconName: 'BedDouble',
  },
  {
    type: 'bed_queen',
    name: 'Queen Size Bed',
    category: 'bedroom',
    defaultWidth: 85,  // ~1.7m
    defaultDepth: 105, // ~2.1m
    height: 0.65,
    color: '#a855f7',
    iconName: 'BedDouble',
  },
  {
    type: 'bed_single',
    name: 'Twin Single Bed',
    category: 'bedroom',
    defaultWidth: 50,  // ~1.0m
    defaultDepth: 100, // ~2.0m
    height: 0.6,
    color: '#c084fc',
    iconName: 'BedSingle',
  },
  {
    type: 'wardrobe',
    name: 'Built-in Wardrobe Closet',
    category: 'bedroom',
    defaultWidth: 100,
    defaultDepth: 32,
    height: 2.2,
    color: '#7c3aed',
    iconName: 'Shirt',
  },
  {
    type: 'nightstand',
    name: 'Bedside Nightstand',
    category: 'bedroom',
    defaultWidth: 26,
    defaultDepth: 24,
    height: 0.55,
    color: '#9333ea',
    iconName: 'Lamp',
  },

  // Kitchen
  {
    type: 'kitchen_island',
    name: 'Kitchen Island with Barstools',
    category: 'kitchen',
    defaultWidth: 110,
    defaultDepth: 50,
    height: 0.9,
    color: '#f59e0b',
    iconName: 'ChefHat',
  },
  {
    type: 'counter_sink',
    name: 'Kitchen Sink Counter',
    category: 'kitchen',
    defaultWidth: 85,
    defaultDepth: 32,
    height: 0.9,
    color: '#d97706',
    iconName: 'Droplet',
  },
  {
    type: 'stove_oven',
    name: 'Cooktop Range & Oven',
    category: 'kitchen',
    defaultWidth: 40,
    defaultDepth: 32,
    height: 0.9,
    color: '#b45309',
    iconName: 'Flame',
  },
  {
    type: 'refrigerator',
    name: 'Double Door Refrigerator',
    category: 'kitchen',
    defaultWidth: 45,
    defaultDepth: 40,
    height: 1.8,
    color: '#78350f',
    iconName: 'Box',
  },

  // Bathroom
  {
    type: 'bathtub',
    name: 'Deep Soak Bathtub',
    category: 'bathroom',
    defaultWidth: 85,
    defaultDepth: 40,
    height: 0.6,
    color: '#06b6d4',
    iconName: 'Bath',
  },
  {
    type: 'shower',
    name: 'Glass Shower Enclosure',
    category: 'bathroom',
    defaultWidth: 50,
    defaultDepth: 50,
    height: 2.1,
    color: '#0891b2',
    iconName: 'ShowerHead',
  },
  {
    type: 'toilet',
    name: 'Water Closet Toilet',
    category: 'bathroom',
    defaultWidth: 26,
    defaultDepth: 36,
    height: 0.75,
    color: '#0e7490',
    iconName: 'Pipette',
  },
  {
    type: 'vanity_sink',
    name: 'Bathroom Vanity & Mirror',
    category: 'bathroom',
    defaultWidth: 50,
    defaultDepth: 30,
    height: 0.85,
    color: '#155e75',
    iconName: 'Sparkles',
  },

  // Office & Study
  {
    type: 'office_desk',
    name: 'Executive Work Desk',
    category: 'office',
    defaultWidth: 80,
    defaultDepth: 40,
    height: 0.75,
    color: '#10b981',
    iconName: 'Monitor',
  },
  {
    type: 'meeting_table',
    name: 'Conference Meeting Table',
    category: 'office',
    defaultWidth: 120,
    defaultDepth: 60,
    height: 0.75,
    color: '#059669',
    iconName: 'Users',
  },
  {
    type: 'office_chair',
    name: 'Ergonomic Task Chair',
    category: 'office',
    defaultWidth: 32,
    defaultDepth: 32,
    height: 1.0,
    color: '#047857',
    iconName: 'Disc',
  },

  // Outdoor & Structure
  {
    type: 'stairs_straight',
    name: 'Straight Architectural Staircase',
    category: 'outdoor',
    defaultWidth: 130,
    defaultDepth: 48,
    height: 2.8,
    color: '#64748b',
    iconName: 'Footprints',
  },
  {
    type: 'potted_plant',
    name: 'Potted Ficus Plant',
    category: 'outdoor',
    defaultWidth: 30,
    defaultDepth: 30,
    height: 1.4,
    color: '#22c55e',
    iconName: 'Flower2',
  },
  {
    type: 'vehicle_car',
    name: 'Sedan Vehicle (Garage Parking)',
    category: 'outdoor',
    defaultWidth: 95,
    defaultDepth: 200,
    height: 1.5,
    color: '#475569',
    iconName: 'Car',
  },
];
