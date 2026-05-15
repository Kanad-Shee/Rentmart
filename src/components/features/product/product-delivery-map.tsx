"use client";

import { CheckCircle2, MapPin, Truck } from "lucide-react";
import { DashboardAddListingMapPreview } from "@/components/features/dashboard/dashboard-add-listing-map-preview";
import type { GeocodedEquipmentLocation } from "@/lib/equipment";

type ProductDeliveryMapProps = {
  deliveryRadiusKm: number;
  location: GeocodedEquipmentLocation;
};

export function ProductDeliveryMap({
  deliveryRadiusKm,
  location,
}: ProductDeliveryMapProps) {
  return (
    <div className='overflow-hidden rounded-2xl border border-[#b7d7c6] bg-[#e7f4ec] shadow-sm'>
      <div className='grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_320px]'>
        <div className='relative min-h-105 bg-[#eaf5ee]'>
          <DashboardAddListingMapPreview
            location={location}
            deliveryRadiusKm={deliveryRadiusKm}
          />

          <div className='absolute left-4 top-4 rounded-full border border-white/70 bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm backdrop-blur-sm'>
            Delivery Area
          </div>
        </div>

        <div className='flex flex-col justify-between gap-6 border-t border-[#b7d7c6] bg-background/85 p-6 backdrop-blur-sm lg:border-l lg:border-t-0'>
          <div>
            <div className='mb-3 flex items-center gap-2 text-primary'>
              <Truck className='h-5 w-5' />
              <p className='text-sm font-bold uppercase'>Delivery Coverage</p>
            </div>
            <h3 className='text-2xl font-semibold text-primary'>
              {deliveryRadiusKm} km delivery radius
            </h3>
            <p className='mt-3 text-sm leading-7 text-muted-foreground'>
              Delivery coverage is centered on the owner&apos;s verified pickup
              location and reflects the exact service area shown on the map.
            </p>
          </div>

          <div className='rounded-xl border border-[#b7d7c6] bg-background/90 p-4 shadow-sm'>
            <div className='flex items-start gap-3'>
              <MapPin className='mt-0.5 h-5 w-5 text-primary' />
              <div>
                <p className='text-sm font-semibold text-primary'>
                  {location.normalizedAddress}
                </p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  On-site handover available
                </p>
              </div>
            </div>
            <div className='mt-4 flex items-center gap-2 text-xs font-semibold text-primary'>
              <CheckCircle2 className='h-4 w-4' />
              Standard maintenance support included
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
