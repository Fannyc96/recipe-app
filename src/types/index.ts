export interface Ingredient {
  name: string
  amount: string
  unit: string
}

export interface RecipeUrl {
  url: string
  name: string
  note: string
}

export interface Recipe {
  id: number
  name: string
  servings: number
  favorite: boolean
  last_used: string | null
  tags: Record<string, string[]>
  ingredients: Record<string, Ingredient[]>
  urls: RecipeUrl[]
  note: string
  created_at?: string
}

export interface AppSettings {
  id: number
  tag_types: Record<string, string[]>
  ingredient_categories: string[]
  common_ingredients: Record<string, string[]>
}
