export interface APIUser {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  avatarUrl: string;
  role?: string;
  status?: string;
}

export interface ClerkUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: {
    emailAddress: string;
    id: string;
    primary?: boolean;
  }[];
  imageUrl: string | null;
  profileImageUrl: string | null;
  deleted?: boolean;
}

export interface UserCreatedEvent {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email_addresses: Array<{
    email_address: string;
    id: string;
  }>;
  image_url: string | null;
  profile_image_url: string | null;
  external_accounts?: Array<{
    provider: string;
    provider_user_id: string;
    id: string;
    [key: string]: any;
  }>;
}

export interface UserDeletedEvent {
  deleted: boolean;
  id: string;
}

export interface UserUpdatedEvent {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email_addresses: Array<{
    email_address: string;
    id: string;
  }>;
  image_url: string | null;
  profile_image_url: string | null;
  primary_email_address_id: string | null;
}
