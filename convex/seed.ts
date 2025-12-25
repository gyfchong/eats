import { mutation } from './_generated/server'

const SEED_RECIPES = [
  // Existing favorites
  {
    link: 'https://immigrantstable.com/baked-harissa-salmon/',
    name: 'Baked harissa salmon',
    cuisine: 'North African',
    isFavorite: true,
    ingredients: ['Salmon', 'Rice'],
  },
  {
    link: 'https://tiffycooks.com/beef-and-broccoli-noodles/',
    name: 'Beef and broccoli noodles',
    cuisine: 'Chinese',
    isFavorite: true,
    ingredients: ['Beef', 'Noodles', 'Add shiitake mushrooms'],
    notes: 'Add shiitake mushrooms',
  },
  {
    link: '',
    name: 'Bok choy and lap cheung fried rice',
    cuisine: 'Chinese',
    isFavorite: true,
    ingredients: ['Lap cheung', 'Rice', 'Bok choy', 'Corn', 'Garlic', 'Ginger'],
    notes: 'Sauce: dark soy sauce, oyster sauce, white pepper',
  },
  {
    link: '',
    name: 'Burmese noodle salad',
    cuisine: 'Burmese',
    isFavorite: true,
    ingredients: [
      'Fishcake, egg',
      'Noodles',
      'Hokkien noodles',
      'Boiled eggs x6',
      'Boiled potatoes (just tender) x4 with tumeric and paprika',
      'Fishcake',
      'Lettuce',
    ],
  },
  {
    link: 'https://www.eatingwell.com/creamy-pesto-shrimp-with-gnocchi-peas-8598661',
    name: 'Creamy pesto shrimp with gnocchi peas',
    cuisine: 'Italian',
    isFavorite: true,
    ingredients: ['Shrimp', 'Gnocchi'],
  },
  {
    link: 'https://www.janicefung.com/chinese-cucumber-salad-recipe/',
    name: 'Cucumber salad',
    cuisine: 'Chinese',
    isFavorite: true,
    ingredients: [],
  },
  {
    link: '',
    name: 'Garlic butter basa fish',
    cuisine: 'Vietnamese',
    isFavorite: true,
    ingredients: ['Fish', 'Potatoes'],
  },
  {
    link: 'https://www.foodandwine.com/recipes/garlic-butter-steak-bites',
    name: 'Garlic butter steak bites',
    cuisine: 'American',
    isFavorite: true,
    ingredients: ['Beef', 'Potatoes'],
  },
  {
    link: 'https://www.instagram.com/reel/DLLZXFmxIGE/?igsh=M2ZwNzU2ZHFqeTJy',
    name: 'Garlic prawn pasta',
    cuisine: 'Italian',
    isFavorite: true,
    ingredients: [
      'Prawns',
      'Pasta',
      '8-10 large shrimp (peeled and deveined seasoned with 1/4 tsp salt, 1/4 tsp smoked paprika, 1 tbsp olive oil)',
      '100g pasta (spaghetti, linguine, or angel hair)',
      '3-4 garlic cloves, finely chopped',
      '1/4 tsp red pepper flakes (optional)',
    ],
    notes:
      '2 tbsp unsalted butter, zest of 1/2 lemon, 1 tbsp lemon juice, 1/4 cup dry white wine or chicken broth, 2 tbsp chopped parsley, 2 tbsp grated parmesan',
  },
  {
    link: 'https://eatwithclarity.com/greek-chicken-bowls/',
    name: 'Greek chicken bowls',
    cuisine: 'Greek',
    isFavorite: true,
    ingredients: ['Chicken', 'Rice'],
  },
  {
    link: 'https://www.donnahay.com.au/recipes/dinner/pizza/harissa-and-smoked-paprika-beef-mince-flatbread',
    name: 'Harissa & smoked paprika beef mince flatbread',
    cuisine: 'Middle Eastern',
    isFavorite: true,
    ingredients: ['Beef', 'Flatbread'],
  },
  {
    link: 'https://www.lastingredient.com/mushroom-corn-penne/',
    name: 'Mushroom corn penne',
    cuisine: 'Italian',
    isFavorite: true,
    ingredients: ['Chorizo', 'Pasta', 'Add chorizo, Alfredo sauce'],
    notes: 'Add chorizo, Alfredo sauce',
  },
  {
    link: 'https://www.deliciousmagazine.co.uk/recipes/cheese-bacon-pesto-puffs/',
    name: 'Open face pastries - mix toppings',
    cuisine: 'Scandinavian',
    isFavorite: true,
    ingredients: [
      'Pastry',
      'Tomato paste',
      'Cheddar/mozzarella',
      'Chorizo, ham',
      'Mushrooms',
      'Spinach',
    ],
    notes: 'Cherry tomatoes, pineapple, egg wash',
  },
  {
    link: 'https://www.eatingwell.com/high-protein-pasta-salad-11712920',
    name: 'Pasta salad',
    cuisine: 'Mediterranean',
    isFavorite: true,
    ingredients: [
      'Tuna',
      'Pasta',
      'Tuna x3 95g',
      'Cherry tomatoes',
      'Cucumber',
      'Bocconcini',
    ],
    notes:
      'Sauce: 1/4 cup oil, 3 tbsps lemon juice, 3 tsps Moroccan spice, 3 tsps italian herbs, 1 tsp thyme, salt, pepper. Optional: sundried tomatoes, roasted capsicum',
  },
  {
    link: 'https://www.marionskitchen.com/15-minute-pork-sesame-udon-noodles/',
    name: 'Pork sesame udon noodles',
    cuisine: 'Japanese',
    isFavorite: true,
    ingredients: ['Pork', 'Noodles'],
  },
  {
    link: 'https://www.recipetineats.com/mushroom-sauce/',
    name: 'Steak and potatoes with mushroom sauce',
    cuisine: 'French',
    isFavorite: true,
    ingredients: ['Beef', 'Potatoes'],
  },
  {
    link: 'https://moribyan.com/sushi-bake/',
    name: 'Sushi bake',
    cuisine: 'Japanese',
    isFavorite: true,
    ingredients: ['Crab', 'Rice'],
  },
  {
    link: 'https://www.recipetineats.com/teriyaki-beef-bowls/',
    name: 'Teriyaki beef bowls',
    cuisine: 'Japanese',
    isFavorite: true,
    ingredients: ['Rice', 'Carrots', 'Zucchini', 'Brown onion', 'Beef mince'],
    notes: '4 cloves garlic, teriyaki sauce: soy, mirin, sugar',
  },
  {
    link: '',
    name: 'Udon and lap cheung stir fry',
    cuisine: 'Asian Fusion',
    isFavorite: true,
    ingredients: [
      'Lap cheung',
      'Noodles',
      'Udon noodles',
      'Lap Cheung',
      'Frozen peas & corn',
      'Spring onions',
      'Garlic',
    ],
    notes: 'Sauce: soy sauce, dark soy sauce, oyster sauce',
  },
  {
    link: 'https://www.delicious.com.au/recipes/zucchini-pesto-pasta-recipe/ctfpj6at',
    name: 'Zucchini pesto pasta',
    cuisine: 'Italian',
    isFavorite: true,
    ingredients: ['Shrimp', 'Pasta', 'Add paprika prawns'],
    notes: 'Add paprika prawns',
  },
]

/**
 * Clear all recipes from the database
 */
export const clearRecipes = mutation({
  handler: async (ctx) => {
    const recipes = await ctx.db.query('recipes').collect()
    for (const recipe of recipes) {
      await ctx.db.delete(recipe._id)
    }
    return {
      success: true,
      deleted: recipes.length,
      message: `Deleted ${recipes.length} recipes`,
    }
  },
})

/**
 * Seed the recipes table with favorite meals from the CSV
 * Run this via the Convex dashboard or CLI to initialize the database
 */
export const seedRecipes = mutation({
  handler: async (ctx) => {
    // Insert seed recipes
    const insertedIds = []
    for (const recipe of SEED_RECIPES) {
      const id = await ctx.db.insert('recipes', {
        link: recipe.link,
        name: recipe.name,
        cuisine: recipe.cuisine,
        isFavorite: recipe.isFavorite,
        ingredients: recipe.ingredients,
        notes: recipe.notes,
      })
      insertedIds.push(id)
    }

    return {
      success: true,
      count: insertedIds.length,
      message: `Seeded ${insertedIds.length} recipes`,
    }
  },
})
