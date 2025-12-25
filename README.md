# LGTM Image Generator

AI を使って LGTM 画像を生成する Chrome 拡張機能です。

## 機能

- **Gemini API (Nano Banana Pro)** または **Ollama** を使用した画像生成
- 複数のカテゴリとスタイルをサポート
- 生成した画像を Markdown 形式でコピー

### カテゴリ

- Food (食べ物)
- Nature (自然)
- Animal (動物)
- Space (宇宙)
- Abstract (抽象)
- Minimal (ミニマル)
- Retro (レトロ)
- Cute (可愛い)
- Cool (かっこいい)

### スタイル

- Photo-realistic
- Illustration
- Watercolor
- Sketch
- Pixel Art

## インストール

1. `chrome://extensions` にアクセス
2. 「デベロッパーモード」を有効化
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このプロジェクトのフォルダを選択

## 設定

### Gemini API を使用する場合

1. [Google AI Studio](https://aistudio.google.com/app/apikey) で API キーを取得
2. 拡張機能の設定ページで API キーを入力

### Ollama を使用する場合

1. Ollama をローカルにインストール
2. 拡張機能の設定ページでサーバー URL とモデル名を設定

## 使い方

1. 拡張機能アイコンをクリック
2. カテゴリとスタイルを選択
3. 「Generate LGTM」ボタンをクリック
4. 生成された画像を「Copy」ボタンで Markdown 形式でコピー

## ライセンス

MIT
