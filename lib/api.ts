import { NextResponse } from "next/server";
import { ApiResult } from "@/lib/types";

export function ok<T>(data: T) {
  return NextResponse.json<ApiResult<T>>({
    success: true,
    data,
  });
}

export function fail(errorCode: string, errorMessage: string, status = 400) {
  return NextResponse.json<ApiResult<null>>(
    {
      success: false,
      data: null,
      errorCode,
      errorMessage,
    },
    { status },
  );
}
