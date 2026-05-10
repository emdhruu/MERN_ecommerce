import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ProductState {
  currentPage: number;
  search: string;
  selectedCategory: string;
  selectedBrand: string;
  sortField: string;
  sortOrder: "asc" | "desc";
  limit: number;
}

const initialState: ProductState = {
  currentPage: 1,
  search: "",
  selectedCategory: "",
  selectedBrand: "",
  sortField: "",
  sortOrder: "asc",
  limit: 10,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.currentPage = 1;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      state.currentPage = 1;
    },
    setSelectedBrand: (state, action: PayloadAction<string>) => {
      state.selectedBrand = action.payload;
      state.currentPage = 1;
    },
    setSortField: (state, action: PayloadAction<string>) => {
      state.sortField = action.payload;
      state.currentPage = 1;
    },
    setSortOrder: (state, action: PayloadAction<"asc" | "desc">) => {
      state.sortOrder = action.payload;
    },
    resetFilters: (state) => {
      state.search = "";
      state.selectedCategory = "";
      state.selectedBrand = "";
      state.sortField = "";
      state.sortOrder = "asc";
      state.currentPage = 1;
    },
  },
});

export const {
  setCurrentPage,
  setSearch,
  setSelectedCategory,
  setSelectedBrand,
  setSortField,
  setSortOrder,
  resetFilters,
} = productSlice.actions;

export default productSlice.reducer;
