import { createSlice, type PayloadAction, type SliceCaseReducers, type ValidateSliceCaseReducers } from "@reduxjs/toolkit";

export interface GenericEntityState<T> {
  status: "idle" | "loading" | "succeeded" | "failed";
  items: T[];
  error: string | null;
}

export function createEntitySlice<T, Reducers extends SliceCaseReducers<GenericEntityState<T>> = SliceCaseReducers<GenericEntityState<T>>>(
  name: string,
  customReducers?: ValidateSliceCaseReducers<GenericEntityState<T>, Reducers>
) {
  const initialState: GenericEntityState<T> = { status: "idle", items: [], error: null };
  return createSlice({
    name,
    initialState,
    reducers: {
      fetchRequested: (state) => { state.status = "loading"; state.error = null; },
      fetchSucceeded: (state, action: PayloadAction<T[]>) => { state.status = "succeeded"; state.items = action.payload; },
      fetchFailed: (state, action: PayloadAction<string>) => { state.status = "failed"; state.error = action.payload; },
      ...(customReducers || {}),
    },
  });
}
