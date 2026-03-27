import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Commercial Disclosure | Reivo',
  description:
    'Disclosure under the Specified Commercial Transaction Act (特定商取引法に基づく表記)',
};

export default function CommercialDisclosurePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to Reivo
        </Link>

        <h1 className="mt-8 text-3xl font-bold">特定商取引法に基づく表記</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Disclosure under the Specified Commercial Transaction Act
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed">
          <table className="w-full border-collapse">
            <tbody className="divide-y">
              <Row label="販売業者" sublabel="Business Name">
                田添 聡士（個人事業）
              </Row>
              <Row label="代表者" sublabel="Representative">
                田添 聡士
              </Row>
              <Row label="所在地" sublabel="Address">
                請求があった場合は遅滞なく開示します
              </Row>
              <Row label="電話番号" sublabel="Phone">
                請求があった場合は遅滞なく開示します
              </Row>
              <Row label="メールアドレス" sublabel="Email">
                hello@reivo.dev
              </Row>
              <Row label="URL" sublabel="Website">
                https://reivo.dev
              </Row>
              <Row label="商品の名称" sublabel="Product Name">
                Reivo（AI Cost Intelligence Platform）
              </Row>
              <Row label="販売価格" sublabel="Pricing">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Free: $0/月（10,000リクエスト/月）</li>
                  <li>Pro: $49/月（100,000リクエスト/月）</li>
                  <li>Team: $199/月（1,000,000リクエスト/月）</li>
                </ul>
                <p className="mt-1 text-muted-foreground">
                  すべて米ドル建て。消費税は価格に含まれます。
                </p>
              </Row>
              <Row label="支払方法" sublabel="Payment Method">
                クレジットカード（Stripe経由）
              </Row>
              <Row label="支払時期" sublabel="Payment Timing">
                月額サブスクリプション。契約時に初回決済、以降毎月自動更新。
              </Row>
              <Row label="商品の引き渡し時期" sublabel="Delivery">
                決済完了後、即時にサービスをご利用いただけます。
              </Row>
              <Row label="返品・キャンセル" sublabel="Refund Policy">
                契約後14日以内であれば全額返金いたします。14日経過後の返金はできませんが、いつでも解約可能で次回更新日以降の課金は発生しません。
              </Row>
              <Row label="動作環境" sublabel="System Requirements">
                インターネット接続環境。APIクライアント（Python、Node.js、cURL等）。
              </Row>
            </tbody>
          </table>
        </div>

        <p className="mt-12 text-xs text-muted-foreground">Last updated: March 27, 2026</p>
      </div>
    </div>
  );
}

function Row({
  label,
  sublabel,
  children,
}: {
  label: string;
  sublabel: string;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td className="py-4 pr-4 align-top font-medium w-1/3">
        {label}
        <span className="block text-xs font-normal text-muted-foreground">{sublabel}</span>
      </td>
      <td className="py-4 align-top">{children}</td>
    </tr>
  );
}
