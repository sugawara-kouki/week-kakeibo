// @testing-library/jest-dom の拡張マッチャーを Vitest の expect に登録する
import "@testing-library/jest-dom/vitest";

/**
 * 拡張マッチャー
 * vitestのexpect関数が持つマッチャー（固有の検証メソッド）を拡張するためのもの
 *
 * testing-library/jest-domが追加するメソッドは下記
 * - toBeInTheDocument(): 要素がdocument.bodyに存在するか
 * - toBeVisible(): 要素がユーザーに可視(表示されている)か
 * - toBeDisabled(): 要素が無効化されているか
 * - toHaveClass(className): 要素が指定したCSSクラスを持つか
 * - toHaveAttribute(name, value): 要素が指定した属性を持つか
 */
