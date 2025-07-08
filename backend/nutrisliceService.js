const axios = require('axios');

class NutrisliceService {
  constructor() {
    this.baseURL = process.env.NUTRISLICE_BASE_URL;
    this.apiKey = process.env.NUTRISLICE_API_KEY;
  }

  async fetchMenuItems(diningHallId, date = new Date()) {
    try {
      // This is a mock implementation - replace with actual Nutrislice API calls
      const mockData = {
        dining_hall_id: diningHallId,
        date: date.toISOString().split('T')[0],
        menu_items: [
          {
            id: 'item_1',
            name: 'Grilled Chicken Breast',
            description: 'Seasoned grilled chicken breast',
            calories: 231,
            protein: 43.5,
            carbs: 0,
            fats: 5.0,
            fiber: 0,
            sugar: 0,
            sodium: 65,
            allergens: [],
            category: 'protein',
            serving_size: '1 piece (120g)',
            is_vegan: false,
            is_vegetarian: false,
            is_gluten_free: true
          },
          {
            id: 'item_2',
            name: 'Brown Rice',
            description: 'Steamed brown rice',
            calories: 112,
            protein: 2.6,
            carbs: 23,
            fats: 0.9,
            fiber: 1.8,
            sugar: 0.4,
            sodium: 1,
            allergens: [],
            category: 'grains',
            serving_size: '1/2 cup (98g)',
            is_vegan: true,
            is_vegetarian: true,
            is_gluten_free: true
          },
          {
            id: 'item_3',
            name: 'Mixed Vegetables',
            description: 'Steamed broccoli, carrots, and green beans',
            calories: 35,
            protein: 2.0,
            carbs: 7,
            fats: 0.1,
            fiber: 3.0,
            sugar: 4,
            sodium: 32,
            allergens: [],
            category: 'vegetables',
            serving_size: '1 cup (85g)',
            is_vegan: true,
            is_vegetarian: true,
            is_gluten_free: true
          }
        ]
      };

      return mockData;
    } catch (error) {
      console.error('Nutrislice API error:', error);
      throw new Error('Failed to fetch menu items');
    }
  }

  async searchMenuItems(query, filters = {}) {
    try {
      // Mock search implementation
      const allItems = await this.fetchMenuItems('default');
      const filteredItems = allItems.menu_items.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase())
      );

      return { menu_items: filteredItems };
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search menu items');
    }
  }
}

module.exports = new NutrisliceService();