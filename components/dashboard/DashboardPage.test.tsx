import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ----------------------------------------------------------
// 外部依存のモック
// ----------------------------------------------------------

// vi.fn()を使ってEntryFormをモック化し、スパイ(役割を代替)できるようにする
let MockEntryForm: ReturnType<typeof vi.fn>;
vi.mock("./EntryForm", () => {
  // モックの実装をここで行う
  MockEntryForm = vi.fn((props) => {
    return <div data-testid="mock-entry-form" />;
  });

  // エクスポート
  return {
    EntryForm: MockEntryForm,
  };
});

// ----------------------------------------------------------
// ダミーデータの定義
// ----------------------------------------------------------

import {
  DashboardPage,
  type DashboardProps,
} from "@/components/dashboard/DashboardPage";
import type { AccountList } from "@/domain/account/schema";
import type { CategoryList } from "@/domain/category/schema";

const DEFAULT_MOCK_CATEGORIES: CategoryList = [
  { id: 1, name: "食費", color: "gray" },
];
const DEFAULT_MOCK_ACCOUNTS: AccountList = [
  { id: 1, name: "PeiPei残高", initialBalance: 5000 },
];
const MOCK_ON_CREATE_ENTRY = vi.fn();

// ------------------------------------------------
// ヘルパー関数
// ------------------------------------------------

/**
 * 必須Propsのデフォルトを設定し、上書きを可能にする関数
 *
 * NOTE::Propsを引数で上書き可能にすることで、テストコードの可読性向上、
 * テストのインプットを簡潔に定義可能といったメリットが存在するために定義
 */
const renderComponent = (props?: Partial<DashboardProps>) => {
  const defaultProps: DashboardProps = {
    categories: DEFAULT_MOCK_CATEGORIES,
    accounts: DEFAULT_MOCK_ACCOUNTS,
    userId: "testUser",
    onCreateEntry: MOCK_ON_CREATE_ENTRY,
  };
  return render(<DashboardPage {...defaultProps} {...props} />);
};

// ------------------------------------------------
// テストスイート
// ------------------------------------------------
describe("DashboardPage", () => {
  // beforeEachを使って、全てのテストの前にレンダリングを実行
  // 各テストケースで renderComponent を呼び出す手間を省くことも可能だが
  // 今回はテストケースごとにPropsを変更する可能性があるため、Factoryを使う形で記述

  // 1. 初期レンダリングのテスト
  describe("初期レンダリング", () => {
    it("タイトル'週単位家計簿'が正しく表示されること", () => {
      renderComponent();
      expect(screen.getByText("週単位家計簿")).toBeInTheDocument();
    });

    it("EntryFormコンポーネントがレンダリングされること", () => {
      renderComponent();
      expect(screen.getByTestId("mock-entry-form")).toBeInTheDocument();
    });
  });

  // 2. Propsの処理とデータの受け渡し
  describe("Propsの受け渡し", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("EntryFormにアカウントとカテゴリのデータが正しく中継されること", () => {
      renderComponent();

      // MockEntryFormが正しいPropsで呼び出されたかを検証
      expect(MockEntryForm).toHaveBeenCalledWith(
        expect.objectContaining({
          categories: DEFAULT_MOCK_CATEGORIES,
          accounts: DEFAULT_MOCK_ACCOUNTS,
        }),
        {},
      );
    });
  });
});
