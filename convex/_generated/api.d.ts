/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as categorizeRecipes from "../categorizeRecipes.js";
import type * as linkPreview from "../linkPreview.js";
import type * as mealPlans from "../mealPlans.js";
import type * as recipes from "../recipes.js";
import type * as restaurants from "../restaurants.js";
import type * as seed from "../seed.js";
import type * as updateRecipeImages from "../updateRecipeImages.js";
import type * as updateRecipeLogos from "../updateRecipeLogos.js";
import type * as utils_mealTypes from "../utils/mealTypes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  categorizeRecipes: typeof categorizeRecipes;
  linkPreview: typeof linkPreview;
  mealPlans: typeof mealPlans;
  recipes: typeof recipes;
  restaurants: typeof restaurants;
  seed: typeof seed;
  updateRecipeImages: typeof updateRecipeImages;
  updateRecipeLogos: typeof updateRecipeLogos;
  "utils/mealTypes": typeof utils_mealTypes;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
