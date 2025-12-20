export interface DwvListResponse {
  total?: number;
  perPage?: number;
  page?: number;
  lastPage?: number;
  data?: DwvProperty[];
}

export interface DwvPropertyResponse {
  data: DwvProperty;
}

export interface DwvProperty {
  id?: number | string;
  code?: string;
  title?: string;
  description?: string;
  headline?: string;
  status?: 'active' | 'inactive' | 'auto_inactive';
  construction_stage?: string;
  construction_stage_raw?: 'pre-market' | 'under construction' | 'new' | 'used';
  rent?: boolean;
  deleted?: boolean;
  address_display_type?: string;
  unit?: DwvUnit;
  building?: DwvBuilding | null;
  third_party_property?: DwvThirdPartyProperty | null;
  construction_company?: DwvConstructionCompany | null;
  last_updated_at?: string;
  [key: string]: any;
}

export interface DwvUnit {
  id?: number | string;
  title?: string;
  price?: string;
  rent?: boolean;
  type?: string;
  floor_plan?: {
    category?: {
      title?: string;
      tag?: string;
    };
  };
  section?: { name?: string };
  parking_spaces?: number;
  dorms?: number;
  suites?: number;
  bathroom?: number;
  private_area?: string;
  util_area?: string;
  total_area?: string;
  payment_conditions?: DwvPaymentCondition[];
  cover?: string | DwvMediaItem;
  additional_galleries?: Array<{
    title?: string;
    files?: DwvMediaItem[];
  }>;
  videos?: DwvVideo[];
  tour_360?: string;
}

export interface DwvBuilding {
  id?: number | string;
  title?: string;
  gallery?: DwvMediaItem[];
  architectural_plans?: DwvMediaItem[];
  video?: string;
  videos?: DwvVideo[];
  tour_360?: string;
  description?: Array<{
    title?: string;
    items?: Array<{ item?: string }>;
  }>;
  address?: DwvAddress;
  text_address?: string;
  incorporation?: string;
  cover?: DwvMediaItem;
  features?: Array<{
    type?: string;
    tags?: string[];
  }>;
  delivery_date?: string;
}

export interface DwvThirdPartyProperty {
  id?: number | string;
  title?: string;
  price?: string;
  type?: string;
  unit_info?: string;
  dorms?: number;
  suites?: number;
  bathroom?: number;
  parking_spaces?: number;
  text_address?: string;
  private_area?: string;
  util_area?: string;
  total_area?: string;
  address?: DwvAddress;
  gallery?: DwvMediaItem[];
  cover?: DwvMediaItem;
  features?: Array<{
    type?: string;
    tags?: string[];
  }>;
  payment_conditions?: DwvPaymentCondition[];
}

export interface DwvConstructionCompany {
  title?: string;
  site?: string;
  whatsapp?: string;
  instagram?: string;
  email?: string;
  business_contacts?: Array<{
    responsible?: string;
    phone_number?: string;
  }>;
  additionals_contacts?: Array<{
    responsible?: string;
    whatsapp?: string;
  }>;
  logo?: DwvMediaItem;
}

export interface DwvAddress {
  street_name?: string;
  street_number?: string;
  neighborhood?: string;
  complement?: string;
  zip_code?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface DwvMediaSizes {
  small?: string;
  medium?: string;
  large?: string;
  circle?: string;
  xfullhd?: string;
  xlarge?: string;
  xmedium?: string;
  xmediumhd?: string;
  [key: string]: string | undefined;
}

export interface DwvMediaItem {
  url?: string;
  title?: string;
  sizes?: DwvMediaSizes;
}

export interface DwvPaymentCondition {
  title?: string;
  operator?: {
    title?: string;
    type?: string;
  };
  value?: string;
}

export interface DwvVideo {
  id?: string;
  url?: string;
  name?: string;
}

