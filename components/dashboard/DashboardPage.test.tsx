import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AccountList } from "@/domain/account/schema";
import type { CategoryList } from "@/domain/category/schema";
import { DashboardPage } from "./DashboardPage";

// 子コンポーネントのモック化
vi.mock("./EntryForm", () => ({
  EntryForm: () => <div data-testid="mock-entry-form">Entry Form</div>,
}));

// テストに必要なダミーデータ
const mockCategories: CategoryList = [{ id: 1, name: "食費", color: "gray" }];
const mockAccounts: AccountList = [
  { id: 1, name: "PeiPei残高", initialBalance: 5000 },
];
const mockOnCreateEntry = vi.fn(); // ダミー関数

describe("DashboardPage", () => {
  it("タイトルが正しく表示されること", () => {
    // コンポーネントを仮想的にレンダリングする
    render(
      <DashboardPage
        categories={mockCategories}
        accounts={mockAccounts}
        userId="testUser"
        onCreateEntry={mockOnCreateEntry}
      />,
    );

    expect(screen.getByText("週単位家計簿")).toBeInTheDocument();
  });
});
