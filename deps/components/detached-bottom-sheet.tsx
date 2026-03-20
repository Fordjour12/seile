import React from "react";

import { BottomSheetTokens } from "@/lib/constants";

import { BottomSheet } from "./bottom-sheet";

type DetachedBottomSheetProps = Omit<React.ComponentProps<typeof BottomSheet>, "snapPoints"> & {
  snapPoints?: ReadonlyArray<string>;
};

export function DetachedBottomSheet({
  snapPoints = BottomSheetTokens.detached.snapPoints,
  ...props
}: DetachedBottomSheetProps) {
  return (
    <BottomSheet
      detached
      bottomInset={BottomSheetTokens.detached.bottomInset}
      style={{
        marginHorizontal: BottomSheetTokens.detached.sideInset,
      }}
      snapPoints={snapPoints}
      {...props}
    />
  );
}
