'use client';

import { useEffect, useRef } from 'react';
import { trackPurchase } from '@/lib/metaPixel';

/**
 * Client component to fire Meta Pixel Purchase event from a Server Component.
 * Ensures deduplication with backend CAPI using orderNumber or order ID as eventId.
 */
export default function TrackPurchase({ order }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!order || hasTracked.current) return;

    const orderId = String(order.orderNumber || order._id || '');
    const totalValue =
      order.pricing?.total ?? order.totalAmount ?? order.total ?? order.amount ?? 0;

    const items =
      order.products && order.products.length > 0
        ? order.products
        : order.product
        ? [order.product]
        : [];

    trackPurchase({
      orderId,
      items,
      totalValue,
      currency: 'INR',
    });

    hasTracked.current = true;
  }, [order]);

  return null;
}
