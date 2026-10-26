import { FormattedMessage } from 'react-intl';

export const ORGANIZATION_SECTIONS = {
  summarySection: 'summarySection',
  bankingInformationSection: 'bankingInformationSection',
  contactInformationSection: 'contactInformationSection',
  contactPeopleSection: 'contactPeopleSection',
  interfacesSection: 'interfacesSection',
  vendorInformationSection: 'vendorInformationSection',
  vendorTermsSection: 'agreementsSection',
  accountsSection: 'accountsSection',
  notesSection: 'notesSection',
  integrationDetailsSection: 'integrationDetailsSection',
  agreements: 'linkedAgreements',
  privilegedDonorInformation: 'privilegedDonorInformation',
};

export const ORGANIZATION_SECTION_LABELS = {
  [ORGANIZATION_SECTIONS.summarySection]: <FormattedMessage id="ui-organizations.summary" />,
  [ORGANIZATION_SECTIONS.bankingInformationSection]: <FormattedMessage id="ui-organizations.bankingInformation" />,
  [ORGANIZATION_SECTIONS.contactInformationSection]: <FormattedMessage id="ui-organizations.contactInformation" />,
  [ORGANIZATION_SECTIONS.contactPeopleSection]: <FormattedMessage id="ui-organizations.contactPeople" />,
  [ORGANIZATION_SECTIONS.interfacesSection]: <FormattedMessage id="ui-organizations.interface" />,
  [ORGANIZATION_SECTIONS.vendorInformationSection]: <FormattedMessage id="ui-organizations.vendorInformation" />,
  [ORGANIZATION_SECTIONS.vendorTermsSection]: <FormattedMessage id="ui-organizations.vendorTerms" />,
  [ORGANIZATION_SECTIONS.accountsSection]: <FormattedMessage id="ui-organizations.accounts" />,
  [ORGANIZATION_SECTIONS.integrationDetailsSection]: <FormattedMessage id="ui-organizations.integrationDetails" />,
  [ORGANIZATION_SECTIONS.agreements]: <FormattedMessage id="ui-organizations.linkedAgreements.section" />,
  [ORGANIZATION_SECTIONS.privilegedDonorInformation]: <FormattedMessage id="ui-organizations.privilegedDonorInformation" />,
};

export const CREATE_UNITS_PERM = 'organizations.acquisitions-units-assignments.create.execute';
export const MANAGE_UNITS_PERM = 'organizations.acquisitions-units-assignments.manage.execute';

// Mapping between attribute (field) in form and id of accordion
export const MAP_FIELD_ACCORDION = {
  name: ORGANIZATION_SECTIONS.summarySection,
  code: ORGANIZATION_SECTIONS.summarySection,
  status: ORGANIZATION_SECTIONS.summarySection,
  aliases: ORGANIZATION_SECTIONS.summarySection,
  addresses: ORGANIZATION_SECTIONS.contactInformationSection,
  phoneNumbers: ORGANIZATION_SECTIONS.contactInformationSection,
  urls: ORGANIZATION_SECTIONS.contactInformationSection,
  agreements: ORGANIZATION_SECTIONS.vendorTermsSection,
  accounts: ORGANIZATION_SECTIONS.accountsSection,
};

export const BANKING_INFORMATION_FIELD_NAME = 'bankingInformation';

export const HIDDEN_FIELDS_FOR_ORGANIZATION_VERSION_HISTORY = [];

export const SUBMIT_ACTION_FIELD_NAME = '__submitAction__';

export const SUBMIT_ACTION = {
  saveAndClose: 'saveAndClose',
  saveAndKeepEditing: 'saveAndKeepEditing',
};
