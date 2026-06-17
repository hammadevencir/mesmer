import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyIdToken } from "@/lib/firebase/auth-server";
import { getAdminFirestore } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME = "mesmer_session";
const APP_CONFIG_COLLECTION = "app_config";
const PAYWALL_OFFER_DOC_ID = "paywall_offer";

function normalizeNumberMs(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.trunc(n);
}

function mapPaywallOffer(data, id) {
  const d = data || {};
  return {
    id,
    annualNowPriceLabel: typeof d.annualNowPriceLabel === "string" ? d.annualNowPriceLabel : "",
    annualPromoTier: typeof d.annualPromoTier === "string" ? d.annualPromoTier : "",
    annualWasPriceLabel: typeof d.annualWasPriceLabel === "string" ? d.annualWasPriceLabel : "",
    discountLabel: typeof d.discountLabel === "string" ? d.discountLabel : "",
    enable: d.enable === true,
    endsAt: normalizeNumberMs(d.endsAt),
    name: typeof d.name === "string" ? d.name : "",
    startsAt: normalizeNumberMs(d.startsAt),
  };
}

function payloadFromBody(body) {
  return {
    annualNowPriceLabel: typeof body?.annualNowPriceLabel === "string" ? body.annualNowPriceLabel.trim() : "",
    annualPromoTier:
      typeof body?.annualPromoTier === "string" ? body.annualPromoTier.trim() : "",
    annualWasPriceLabel:
      typeof body?.annualWasPriceLabel === "string" ? body.annualWasPriceLabel.trim() : "",
    discountLabel:
      typeof body?.discountLabel === "string" ? body.discountLabel.trim() : "",
    enable: body?.enable === true,
    endsAt: normalizeNumberMs(body?.endsAt),
    name: typeof body?.name === "string" ? body.name.trim() : "",
    startsAt: normalizeNumberMs(body?.startsAt),
  };
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const decoded = token ? await verifyIdToken(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminFirestore();
    const snap = await db
      .collection(APP_CONFIG_COLLECTION)
      .doc(PAYWALL_OFFER_DOC_ID)
      .get();

    if (!snap.exists) {
      return NextResponse.json({
        ...mapPaywallOffer({}, PAYWALL_OFFER_DOC_ID),
        exists: false,
      });
    }

    const offer = mapPaywallOffer(snap.data(), snap.id);
    return NextResponse.json({ ...offer, exists: true });
  } catch (e) {
    console.error("GET /api/admin/paywall-offer error:", e);
    return NextResponse.json(
      { error: "Failed to load paywall offer" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const decoded = token ? await verifyIdToken(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const update = payloadFromBody(body);

    const db = getAdminFirestore();
    const ref = db.collection(APP_CONFIG_COLLECTION).doc(PAYWALL_OFFER_DOC_ID);
    await ref.set(update, { merge: true });

    const snap = await ref.get();
    const offer = mapPaywallOffer(snap.data(), snap.id);

    return NextResponse.json({ ...offer, exists: true });
  } catch (e) {
    console.error("PUT /api/admin/paywall-offer error:", e);
    return NextResponse.json(
      { error: "Failed to save paywall offer" },
      { status: 500 },
    );
  }
}
