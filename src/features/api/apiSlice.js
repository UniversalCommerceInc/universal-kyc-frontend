import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://98.70.53.81:3005/",
    prepareHeaders: (headers, { getState }) => {
   
      const token = getState().auth.token; 
      // console.log(token, "token------------")
      if (token) {
        headers.set("Authorization", `Bearer ${token}`); 
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({}),
});
