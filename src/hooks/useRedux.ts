import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";

// Hooks Redux typés - meilleure pratique recommandée par Redux Toolkit
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);
