import type { BasicStoreCommon, BasicStoreIdentifier, StoreMarkingDefinition } from './store';
import type { Group } from './group';
import type { ConfidenceLevel } from '../generated/graphql';

interface UserRole extends BasicStoreIdentifier {
  name: string;
}

interface UserCapability {
  name: string;
}

interface UserOrigin {
  socket: string;
  name?: string;
  user_id?: string;
  group_ids?: string[];
  organization_ids?: string[];
  applicant_id?: string;
  playbook_id?: string;
  referer?: string;
  user_metadata?: object;
}

interface AuthUser extends BasicStoreIdentifier {
  entity_type: string
  id: string
  internal_id: string
  individual_id: string | undefined
  name: string
  user_email: string
  account_lock_after_date: Date | undefined
  origin: Partial<UserOrigin>
  roles: Array<UserRole>
  groups: Array<Group>
  organizations: Array<BasicStoreCommon>
  administrated_organizations: Array<BasicStoreCommon>
  capabilities: Array<UserCapability>
  allowed_marking: Array<StoreMarkingDefinition>
  default_marking?: Array<{ entity_type: string, values: Array<StoreMarkingDefinition> }>
  max_shareable_marking: Array<StoreMarkingDefinition>
  api_token: string
  account_status: string
  effective_confidence_level: ConfidenceLevel | null
  restrict_delete: boolean | null
  no_creators: boolean | null
  user_confidence_level: ConfidenceLevel | null
  personal_notifiers?: Array<string>
  draft_context?: string | undefined
  otp_activated?: boolean;
  otp_secret?: string;
}

interface AuthContext {
  otp_mandatory: boolean
  source: string
  tracing: TracingContext
  user: AuthUser | undefined
  draft_context?: string | undefined
  eventId?: string | undefined
  user_inside_platform_organization: boolean
  user_otp_validated?: boolean
  user_with_session?: boolean
}
