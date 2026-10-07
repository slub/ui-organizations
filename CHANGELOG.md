# Change history for ui-organizations

## 7.1.0 (IN PROGRESS)

## [7.0.0](https://github.com/folio-org/ui-organizations/tree/v7.0.0) (2026-04-17)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v6.0.1...v7.0.0)

* Change radio buttons into drop-down in Settings > Organizations > Number generator options. Refs UIORGS-462.
* Upgrade `@folio/stripes-acq-components` to `v7.0.2`. Refs UIORGS-466.
* Memoize initial values for the integration form to prevent data from becoming stale. Refs UIORGS-472.
* Include global `stripes-core.settings.read` permission in base permission sets. Refs UIORGS-476.
* Replace the `moment` library with `dayjs` (Part 1). Refs UIORGS-463.
* Rename permissions to make it easier to differentiate between them. Refs UIORGS-478.

## [6.0.1](https://github.com/folio-org/ui-organizations/tree/v6.0.1) (2025-05-05)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v6.0.0...v6.0.1)

* Improve organization integration form fields validation. Refs UIORGS-468.

## [6.0.0](https://github.com/folio-org/ui-organizations/tree/v6.0.0) (2025-03-12)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v5.2.0...v6.0.0)

* *BREAKING* Display all versions in change log in fourth pane. Refs UIORGS-355.
* Show in version history record view, which fields have been edited. Refs UIORGS-356.
* Adapt organization metadata fields to version history mechanism. Refs UIORGS-359.
* Add claiming to organization integration details. Refs UIORGS-442.
* Add "Duplicate" integration action to organization integration view. Refs UIORGS-441.
* *BREAKING* Add number generator for vendor code including settings page. Refs UIORGS-336, UIORGS-337.
* Enhancement help text on Settings > Organizations > Number generator options. Refs UIORGS-453.
* React v19: refactor away from react-test-renderer. Refs UIORGS-433.
* React v19: refactor away from default props for functional components. Refs UIORGS-434.
* Migrate to shared GA workflows. Refs UIORGS-458.
* *BREAKING* Migrate stripes dependencies to their Sunflower versions. Refs UIORGS-459.
* *BREAKING* Migrate `react-intl` to v7. Refs UIORGS-460.
* Add a Save & keep editing button. Refs UIORGS-449.

## [5.2.0](https://github.com/folio-org/ui-organizations/tree/v5.2.0) (2024-10-31)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v5.1.1...v5.2.0)

* UX Consistency: HTML Page Title display when the third pane (detail record) displays. Refs UIORGS-423.
* Settings > Organizations > Banking information is not properly fenced off by permissions. Refs UIORGS-436.
* Use Save & close button label stripes-component translation key - all UI modules. Refs UIORGS-425.
* Clean up ui-organizations permissions. Refs UIORGS-445.
* Banking - prevent deletion of account type if it is being used by an organization. Refs UIORGS-435.

## [5.1.1](https://github.com/folio-org/ui-organizations/tree/v5.1.1) (2024-04-18)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v5.1.0...v5.1.1)

* Add additional filters to support reporting requirements. Refs UIORG-193.

## [5.1.0](https://github.com/folio-org/ui-organizations/tree/v5.1.0) (2024-03-19)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v5.0.0...v5.1.0)

* Designate Organization as donor. Refs UIORGS-383.
* Settings for banking information. Refs UIORGS-391.
* Implement organization's banking information form. Refs UIORGS-390.
* Implement organization's banking information details view. Refs UIORGS-389.
* Modify summary display in organization view mode. Refs UIORGS-398.
* Protection of viewing and changes of banking information by permissions. Refs UIORGS-388.
* Search organization on bank account number. Refs UIORGS-392.
* Enable "Hourly" and "Monthly" EDI export scheduling frequency options. Refs UIORGS-415.
* Create Privileged donor information accordion in organization record. Refs UIORGS-397.
* Factor away from unsupported `color()` function. Refs UIORGS-416.
* Suppress banking information management for unauthorized user. Refs UIORGS-418.
* Add validation for `Day` field in `Monthly` scheduler for export method. Refs UIORGS-417.
* Support `data-export-spring` interface `v2.0`. Refs UXPROD-3903.
* Accurately handle user permissions for banking information operations. Refs UIORGS-424.
* UX Consistency > Search results > Update HTML page title with search term entered. Refs UIORGS-421.

## [5.0.0](https://github.com/folio-org/ui-organizations/tree/v5.0.0) (2023-10-12)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v4.0.0...v5.0.0)

* Unpin `@rehooks/local-storage` now that it's no longer broken. Refs UIORGS-344.
* Add `Note` field to contact people summary list. Refs UIORGS-352.
* Organizations filters consistency in `ui-organizations` and `ui-plugin-find-organization` . Refs UIORGS-373.
* No pop-up message when creating or editing an organization. Refs UIORGS-375.
* Introduce new permission to view all organizations' settings. Refs UIORGS-346.
* *BREAKING* Upgrade React to v18. Refs UIORGS-377.
* Upgrade `Node.js` to `18` version in GitHub Actions. Refs UIORGS-378.
* *BREAKING* bump `react-intl` to `v6.4.4`. Refs UIORGS-386.
* Add a message indicating future functionality for EDI naming convention. Refs UIORGS-382.
* Bump optional plugins to their `@folio/stripes` `v9` compatible versions. Refs UIORGS-404.

## [4.0.0](https://github.com/folio-org/ui-organizations/tree/v4.0.0) (2023-02-22)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v3.3.1...v4.0.0)

* Provide local translations to `ControlledVocab`. Refs UIORGS-335.
* Results List | Hyperlink one column to improve accessibility. Refs UIORGS-328.
* *BREAKING*: Update `@folio/stripes` to `8.0.0`. Refs UIORGS-342.
* Upgrade `stripes-acq-components` to `v4` and upgrade `react-redux` to `v8`. Refs UIORGS-343.

## [3.3.1](https://github.com/folio-org/ui-organizations/tree/v3.3.1) (2022-11-30)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v3.3.0...v3.3.1)

* Fix timezone in organization integration config for "Daily" schedule period. Refs UIORGS-338.
* "No results found" shown after return to search page. Refs UIORGS-323.

## [3.3.0](https://github.com/folio-org/ui-organizations/tree/v3.3.0) (2022-10-27)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v3.2.1...v3.3.0)

* Support interface `users` version `16.0`. Refs UIORGS-324.
* Disable hourly and monthly schedule periods. Refs UIORGS-330.
* The days previously selected for weekly scheduling are displayed in the updated scheduling settings. Refs UIORGS-331.
* Dependency `react-tether` is incompatible with react 17. Refs UIORGS-333.

## [3.2.1](https://github.com/folio-org/ui-organizations/tree/v3.2.1) (2022-08-04)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v3.2.0...v3.2.1)

* Edit Organizations record: Unselecting Vendor checkbox results in 400 error. Refs UIORGS-325.

## [3.2.0](https://github.com/folio-org/ui-organizations/tree/v3.2.0) (2022-07-07)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v3.1.2...v3.2.0)

* Create area Settings - Organizations - Types. Refs UIORGS-283.
* Add record metadata widget to contact person. Refs UIORGS-305.
* Display linked agreements on an organization record. Refs UIORGS-306.
* Remove react-hot-loader. Refs UIORGS-313.
* Select filter should announce the number of Results in Result List pane header. Refs UIORGS-310.
* Select Type from controlled vocabulary list. Refs UIORGS-285.
* Replace `babel-eslint` with `@babel/eslint-parser`. Refs UIORGS-317.
* Add specific permissions for Integration FTP username and password. Refs UIORGS-316.
* Make LibEdiCode, VendorEdiCode, FTP port required (Integration form). Refs UIORGS-318.

## [3.1.2](https://github.com/folio-org/ui-organizations/tree/v3.1.2) (2022-03-29)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v3.1.1...v3.1.2)

* Manage acquisition unit permission not working. Refs UIORGS-312.

## [3.1.1](https://github.com/folio-org/ui-organizations/tree/v3.1.1) (2022-03-24)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v3.1.0...v3.1.1)

* Can not delete integration from organization. Refs UIORGS-307.

## [3.1.0](https://github.com/folio-org/ui-organizations/tree/v3.1.0) (2022-03-04)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v3.0.1...v3.1.0)

* View details - Organization record can contain multiple "Integration details" configurations. Refs UIORGS-274.
* Create details - Organization record can contain multiple "Integration details" configurations. Refs UIORGS-271.
* Display integration configuration view. Refs UIORGS-279.
* Add a return to Organizations default search to app context menu dropdown. Refs UIORGS-276.
* EDI migration process. Refs UIORGS-280.
* useIntegrationConfigs hook usage from stripes-acq-components. Refs UIORGS-281.
* useOrganization hook usage from stripes-acq-components. Refs UIORGS-282.
* Validation for "Account number" must be unique for organization. Refs UIORGS-292.
* Adding tenant's timezone in Organization integration form.Refs UIORGS-300.
* Allow user to set EDI naming convention. Refs UIORGS-301.
* URLs should be hyperlinks in the view. Refs UIORGS-299.
* Refactor psets away from backend ".all" permissions. Refs UIORGS-265.
* ui-organizations accessibility analysis. Refs UINV-359.
* Avoid undefined backend permissions. Refs UIORGS-304.

## [3.0.1](https://github.com/folio-org/ui-organizations/tree/v3.0.1) (2021-11-02)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v3.0.0...v3.0.1)

* Organization tags can't be saved. Refs UIORGS-267.
* View organization exports action. Refs UIORGS-270.

## [3.0.0](https://github.com/folio-org/ui-organizations/tree/v3.0.0) (2021-10-05)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v2.4.1...v3.0.0)

* Expand sub accordions when user clicks "Expand all". Refs UIORGS-255.
* Add translations for permissions. Refs UIORGS-179.
* increment stripes to v7. Refs UIORGS-256.
* Organizations - Implement MCL Next/Previous pagination. Refs UIORGS-257.
* Filter label contains extra 's'. Refs UIORGS-263.

## [2.4.1](https://github.com/folio-org/ui-organizations/tree/v2.4.1) (2021-07-27)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v2.4.0...v2.4.1)

* Wrap Organization code in double quotes when validating. Refs UIORGS-252.
* permission sets should avoid .all permissions. Refs UIORGS-251.

## [2.4.0](https://github.com/folio-org/ui-organizations/tree/v2.4.0) (2021-06-17)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v2.3.2...v2.4.0)

* Acquisition units no longer restrict edit create or delete actions from action menu. Refs UIORGS-243.
* Display contact people status in organization view. Refs UIORGS-248.
* Implement Keyboard shortcuts modal. Refs UIORGS-246.
* Force open accordion for required not filled fields. Refs UIORGS-244.
* Some fields in the "Account" accordion should not be required. Refs UIORGS-245.
* Compile Translation Files into AST Format. Refs UIORGS-238.
* eslint@"^7.7.0" causes peer-dep inconsistency. Refs UIORGS-249.
* Resizable Panes - Persistence | Use PersistedPaneset smart component. Refs UIORGS-239.
* Organizations app | Apply basic shortcut keys. Refs UIORGS-230.

## [2.3.2](https://github.com/folio-org/ui-organizations/tree/v2.3.2) (2021-04-19)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v2.3.1...v2.3.2)

* Hide `Copy` action (Organizations: Copy interface does not work). Refs UIORGS-241.
* Hide `Copy` action (Organizations: Copy contact person does not work). Refs UIORGS-242.
* EDI scheduling time incorrectly formatted on edit form. Refs UIORGS-236.

## [2.3.1](https://github.com/folio-org/ui-organizations/tree/v2.3.1) (2021-04-13)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v2.3.0...v2.3.1)

* "Collapse all" accordions on "contact person" view not working. Refs UIORGS-231.
* Contact persons email does not appear in the view. Refs UIORGS-232.
* Deleting a contact person assigned to multiple orgs creates UI error. UIORGS-234.
* State-Region label runs off the chart. Refs UIORGS-233.
* EDI scheduling time incorrectly formatted on edit form. Refs UIORGS-236.

## [2.3.0](https://github.com/folio-org/ui-organizations/tree/v2.3.0) (2021-03-15)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v2.2.1...v2.3.0)

* Upgrade to stripes v6.
* Centralizing country and language data in stripes components. Refs UIORGS-227.
* Translate "Tax" in OrganizationVendorInfoForm. Refs UIORGS-218.
* Translate "Scheduling" in OrganizationEDIInfoForm. Refs UIORGS-216.
* Fix inconsistent use of singular/plural for email addresses. Refs UIORGS-217.
* Remove unused locale keys in `en.json`. Refs UIORGS-215.
* Add personal data disclosure form. Refs UIORGS-222.
* Interface credentials not saving when create interface. Refs UIORGS-224
* Contact information categories are not translated. Refs UIORGS-219.
* Migrate Organization and Contact Forms to React-final-form. Refs UIORGS-200.

## [2.2.1](https://github.com/folio-org/ui-organizations/tree/v2.2.1) (2020-11-10)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v2.2.0...v2.2.1)

* Org list - Move focus to results pane when response has come. Refs UIORGS-208
* Accessibility Error: Buttons must have discernible text. Refs-UIORGS-210.

## [2.2.0](https://github.com/folio-org/ui-organizations/tree/v2.2.0) (2020-10-09)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v2.1.2...v2.2.0)

* Focus details pane after user clicks on org in the search results. Refs UIORGS-207
* Focus details pane after user redirected from organization form. Refs UIORGS-206
* Add "add alternative names" button label. Refs UIORGS-205
* Select list default values not saving in form. Refs UIORGS-203
* Update view pane to display null as hyphen. Refs UIORGS-201
* Fix Typing into drop down box, does not pull the type ahead pick-list. Refs UIORGS-198
* Fix Can NOT remove delivery method from interface. Refs UIORGS-199
* Allow use of spaces in organization code. Refs UIORGS-190
* Ability to use notes with organization record. Refs UIORGS-184
* Add "Export to accounting" toggle and logic to organization/invoice record. Refs UIORGS-186
* End of list displays for search results before all records are loaded. Refs UIORGS-197
* Display contact people in alphabetical order. Refs UIORGS-192

### Stories
* [UISACQCOMP-3](https://issues.folio.org/browse/UISACQCOMP-3) Handle import of stripes-acq-components to modules and platform

### Bug fixes
* [UIORGS-170](https://issues.folio.org/browse/UIORGS-170) Accessibility Error: Form elements must have labels
* [UIORGS-169](https://issues.folio.org/browse/UIORGS-169) Accessibility Error: id attribute value must be unique
* [UIORGS-166](https://issues.folio.org/browse/UIORGS-166) Accessibility Error: Heading levels should only increase by one
* [UIORGS-162](https://issues.folio.org/browse/UIORGS-162) Accessibility Error: Buttons must have discernible text
* [UISACQCOMP-2](https://issues.folio.org/browse/UISACQCOMP-2) ACQ - CurrencySelect values are not translated
* [UIORGS-172](https://issues.folio.org/browse/UIORGS-172) a11y error: Form elements must have labels
* [UIORGS-159](https://issues.folio.org/browse/UIORGS-159) Accessibility Error: Form elements must have labels
* [UIORGS-157](https://issues.folio.org/browse/UIORGS-157) Accessibility error: IDs of active elements must be unique

## [2.1.2](https://github.com/folio-org/ui-organizations/tree/v2.1.2) (2020-07-31)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v2.1.1...v2.1.2)

* Fix Can not add add accounts to organization from edit form. Refs UIORGS-193

## [2.1.1](https://github.com/folio-org/ui-organizations/tree/v2.1.1) (2020-07-01)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v2.1.0...v2.1.1)

### Bug fixes
* [UIORGS-189](https://issues.folio.org/browse/UIORGS-189) Alias descriptions not displayed if Alias 1 has no description
* [UIORGS-187](https://issues.folio.org/browse/UIORGS-187) User not aware you need to search Language using language code

## [2.1.0](https://github.com/folio-org/ui-organizations/tree/v2.1.0) (2020-06-12)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v2.0.1...v2.1.0)

### Stories
* [UIORGS-121](https://issues.folio.org/browse/UIORGS-121) Ability to assign acquisition unit(s) to organization records
* [UIORGS-78](https://issues.folio.org/browse/UIORGS-78) Ability to add acquisition unit(s) to organization account(s)
* [UIORGS-176](https://issues.folio.org/browse/UIORGS-176) Add search filter for Acquisition units to Organization search
* [UIORGS-178](https://issues.folio.org/browse/UIORGS-178) Redirect API calls from mod-organizations-storage to mod-organzations
* [UIORGS-180](https://issues.folio.org/browse/UIORGS-180) Organizations app: Update to Stripes v4
* [UIORGS-15](https://issues.folio.org/browse/UIORGS-15) Increase unit testing code coverage
* [UINV-138](https://issues.folio.org/browse/UINV-138) Align actions icons in table to right hand side of view pane(s)

### Bug fixes
* [UIORGS-177](https://issues.folio.org/browse/UIORGS-177) Attempting to create an organization with a space in the Code returns an incorrect error
* [UIORGS-135](https://issues.folio.org/browse/UIORGS-135) Contact people create and Edit form object overlap
* [UIORGS-151](https://issues.folio.org/browse/UIORGS-151) Organizations is not using the same Expand/Collapse as implemented in Q4 2019
* [UIORGS-128](https://issues.folio.org/browse/UIORGS-128) Edit Organizations: Interface table does not look right
* [UIORGS-154](https://issues.folio.org/browse/UIORGS-154) Delete action at top of action menu

## [2.0.1](https://github.com/folio-org/ui-organizations/tree/v2.0.1) (2020-03-27)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v2.0.0...v2.0.1)

### Bug fixes
* [UIORGS-155](https://issues.folio.org/browse/UIORGS-155) Country codes are handled inconsistently in organization vs. contact addresses

## [2.0.0](https://github.com/folio-org/ui-organizations/tree/v2.0.0) (2020-03-13)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v1.6.1...v2.0.0)

* bump the @folio/stripes peer to v3.0.0

### Stories
* [UIORGS-93](https://issues.folio.org/browse/UIORGS-93) Update the country and language lists in the create/edit Contacts screen
* [UIORGS-92](https://issues.folio.org/browse/UIORGS-92) Update the country and language lists in the create/edit Organizations screen
* [UIORGS-110](https://issues.folio.org/browse/UIORGS-143) Change the Organizations default filters to be empty
* [UIORGS-143](https://issues.folio.org/browse/UIORGS-143) Update settings permission label
* [FOLIO-2436](https://issues.folio.org/browse/FOLIO-2436) organizations-storage.organizations version
* [UIORGS-89](https://issues.folio.org/browse/UIORGS-89) Assign a newly created interface to an Organization record
* [UIORGS-131](https://issues.folio.org/browse/UIORGS-131) Update table layouts in edit forms to remove redundant headings
* [UIORGS-130](https://issues.folio.org/browse/UIORGS-130) TECH-DEBT refactor Organizations list to not use SearchAndSort

### Bug Fixes
* [ERM-722](https://issues.folio.org/browse/ERM-722) Agreements and Licenses: Preview: Links to Organizations have stopped working
* [UIORGS-147](https://issues.folio.org/browse/UIORGS-147) Country filter not working
* [UIORGS-144](https://issues.folio.org/browse/UIORGS-144) Security update eslint to >= 6.2.1 or eslint-util >= 1.4.1
* [UIORGS-127](https://issues.folio.org/browse/UIORGS-127) EDI schedule days shown incorrectly
* [UIORGS-129](https://issues.folio.org/browse/UIORGS-129) Organization codes should be unique
* [UIORGS-137](https://issues.folio.org/browse/UIORGS-137) Create/assign Contact for Organization record takes additional step to complete

## [1.6.1](https://github.com/folio-org/ui-organizations/tree/v1.6.1) (2019-12-18)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v1.6.0...v1.6.1)

### Stories
* [UIORGS-125](https://issues.folio.org/browse/UIORGS-125) Organizations view pane: Update contact information layout
* [UIORGS-124](https://issues.folio.org/browse/UIORGS-124) Update contact people edit form layout
* [UIORGS-122](https://issues.folio.org/browse/UIORGS-122) Organization view pane: Update contact people view
* [UIORGS-123](https://issues.folio.org/browse/UIORGS-123) Update contact people view

### Bug Fixes
* [UIORGS-132](https://issues.folio.org/browse/UIORGS-132) Unable to search by contact information in Organizations

## [1.6.0](https://github.com/folio-org/ui-organizations/tree/v1.6.0) (2019-12-04)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v1.5.0...v1.6.0)

### Stories
* [UIORGS-86](https://issues.folio.org/browse/UIORGS-86) Add ability to hide credentials once they've been shown
* [UIORGS-90](https://issues.folio.org/browse/UIORGS-90) Refine Organization filters
* [UIORGS-114](https://issues.folio.org/browse/UIORGS-114) Organization: Update "save and close" and "Cancel" Buttons - UX
* [UIORGS-115](https://issues.folio.org/browse/UIORGS-115) Update Organization layout for create and edit
* [UIORGS-116](https://issues.folio.org/browse/UIORGS-116) Filter organizations by tags

### Bug Fixes
* [UIORGS-84](https://issues.folio.org/browse/UIORGS-84) Fix capitalization of phrases in ui-organizations
* [UIORGS-99](https://issues.folio.org/browse/UIORGS-99) Username and password field for interfaces masked even if empty
* [UIORGS-100](https://issues.folio.org/browse/UIORGS-100) Change the input of the Interface name to required
* [STCOM-590](https://issues.folio.org/browse/STCOM-590) MCL column width updates

## [1.5.0](https://github.com/folio-org/ui-organizations/tree/v1.5.0) (2019-09-11)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v1.4.0...v1.5.0)

### Stories
* [UIORGS-97](https://issues.folio.org/browse/UIORGS-97) Update the currency list for vendors to rely on the standard currency list

### Bug Fixes
* [UIORGS-87](https://issues.folio.org/browse/UIORGS-87) Unable to assign an interface to an Organization
* [UIOR-367](https://issues.folio.org/browse/UIOR-367) Fix search query

## [1.4.0](https://github.com/folio-org/ui-organizations/tree/v1.4.0) (2019-08-26)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v1.3.0...v1.4.0)

### Stories
* [UIORGS-79](https://issues.folio.org/browse/UIORGS-79) Reconfigure the UI permissions for the Organizations App
* [UIORGS-75](https://issues.folio.org/browse/UIORGS-75) When opening Orgs app, default filtered to Active & Pending
* [UIORGS-74](https://issues.folio.org/browse/UIORGS-74) Reconfigure the Organizations remove button and add confirmation modal
* [UIORGS-71](https://issues.folio.org/browse/UIORGS-71) UI fix: change "remove" buttons to trashcans in Organization records
* [UIORGS-39](https://issues.folio.org/browse/UIORGS-39) Vendor/Organization app | View Detail Record | Interface > password display
* [UIORGS-30](https://issues.folio.org/browse/UIORGS-30) Handle vendor checkbox change in "edit organization" screen for organizations
* [UIORGS-18](https://issues.folio.org/browse/UIORGS-18) Changes to primary address/email/phone_number/urls
* [UIORGS-13](https://issues.folio.org/browse/UIORGS-13) Assign tags to Organization Records
* [UIORGS-11](https://issues.folio.org/browse/UIORGS-11) Populate language fields initially with Organization "Default language"
* [UIORGS-10](https://issues.folio.org/browse/UIORGS-10) Start with filters closed

### Bug Fixes
* [UIORGS-95](https://issues.folio.org/browse/UIORGS-95) Interface: Username and Password auto-populates with saved username/password

## [1.3.0](https://github.com/folio-org/ui-organizations/tree/v1.3.0) (2019-07-23)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v1.2.0...v1.3.0)

* [UIORGS-9](https://issues.folio.org/browse/UIORGS-9) Add metadata widget to the top of the organization record
* [UIORGS-76](https://issues.folio.org/browse/UIORGS-76) Permissions problems with ui-organizations (more fixes)
* [UIORGS-81](https://issues.folio.org/browse/UIORGS-81) test permissions with BigTest

## [1.2.0](https://github.com/folio-org/ui-organizations/tree/v1.2.0) (2019-06-11)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v1.1.0...v1.2.0)
* [UIORGS-76](https://issues.folio.org/browse/UIORGS-76) Permissions problems with ui-organizations;
* [UIORGS-72](https://issues.folio.org/browse/UIORGS-72) Add “Is Vendor” column to Organizations search results and add Filter for "Is Vendor";
* [UIORGS-47](https://issues.folio.org/browse/UIORGS-47) Create/Edit Contact Form;
* [UIORGS-55](https://issues.folio.org/browse/UIORGS-55) Organizations App | Interface Accordion > New Field : Interface Type;
* [UIORGS-36](https://issues.folio.org/browse/UIORGS-36) Un-assign and delete interface form View interface;
* [UIORGS-35](https://issues.folio.org/browse/UIORGS-35) Assign Interfaces;
* [UIORGS-34](https://issues.folio.org/browse/UIORGS-34) Create and Edit interfaces;
* [UIORGS-57](https://issues.folio.org/browse/UIORGS-57) un-assign from organization edit;
* [UIORGS-67](https://issues.folio.org/browse/UIORGS-67) Add note field to contact person;
* [UIORGS-51](https://issues.folio.org/browse/UIORGS-51) Select and add multiple contacts at once;
* [UIORGS-56](https://issues.folio.org/browse/UIORGS-56) View interface;

## [1.1.0](https://github.com/folio-org/ui-organizations/tree/v1.1.0) (2019-05-10)
[Full Changelog](https://github.com/folio-org/ui-organizations/compare/v1.0.0...v1.1.0)

* UIORGS-47 Create/Edit Contact Form
* UIORGS-48 Delete contact action
* UIORGS-50 Modal Select Contact with SearchAndSort implementation
* UIORGS-63 "New" button on modal "Add contacts" to create new one
* UIORGS-52 Un-assign contact function
* UIORGS-38 Problem with vendor lookup when creating a PO
* UIORGS-54 Country should not be a required field
* UIORGS-50 Modal Select Contact with SearchAndSort implementation

## [1.0.0](https://github.com/folio-org/ui-organizations/tree/v1.0.0) (2019-04-26)
* Migrate from ui-vendors
* UIORGS-53 make org status values consistent with back-end
* UIORGS-46 View Contact component
* UIORGS-43 View "contact person" on organization view
* UIORGS-33 Swith to new API (organizations-storage)
* UIORGS-23 Remove asterisks from fields in translations
* UIORGS-17 Create BigTest skeleton/Mirage
* UIORGS-4 Restructure "edit vendor" screen for organizations
* UIORGS-3 Restructure "create vendor" screen for organizations
* UIORGS-2 Restructure "view details" screen for organizations
* UIORGS-1 Project Setup
