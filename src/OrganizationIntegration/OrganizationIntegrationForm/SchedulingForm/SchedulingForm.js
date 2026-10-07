import React, { useEffect } from 'react';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import {
  Field,
  useForm,
} from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';

import {
  Accordion,
  Checkbox,
  Col,
  Datepicker,
  Row,
  Select,
  Timepicker,
  TextField,
} from '@folio/stripes/components';
import {
  validateRequired,
  validateRequiredPositiveNumber,
} from '@folio/stripes-acq-components';

import {
  SCHEDULE_PERIODS,
  WEEKDAYS,
} from '../../constants';
import { isTransmissionMethodEmail } from '../../utils';
import {
  ALLOWED_SCHEDULE_PERIODS,
  MAX_DAYS_OF_MONTHLY_SCHEDULE,
  MIN_REQUIRED_NUMBER,
} from './constants';
import {
  validateRequiredMinAndMaxNumber,
  normalizeNumber,
  validatePeriod,
} from './utils';

export const SchedulingForm = () => {
  const { formatMessage } = useIntl();
  const { getState, change } = useForm();

  const formValues = getState()?.values;
  const ediSchedule = formValues?.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig?.ediSchedule || {};
  const isScheduleEnabled = ediSchedule.enableScheduledExport;
  const schedulePeriod = ediSchedule.scheduleParameters?.schedulePeriod;
  const scheduleLabelId = isTransmissionMethodEmail(formValues)
    ? 'ui-organizations.integration.scheduling.scheduleEmail'
    : 'ui-organizations.integration.scheduling.scheduleEDI';

  useEffect(() => {
    if (schedulePeriod && !ALLOWED_SCHEDULE_PERIODS.includes(schedulePeriod)) {
      change(
        'exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule.scheduleParameters.schedulePeriod',
        'NONE',
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedulePeriod]);

  const schedulePeriodOptions = Object.keys(SCHEDULE_PERIODS)
    .filter(periodKey => ALLOWED_SCHEDULE_PERIODS.includes(SCHEDULE_PERIODS[periodKey]))
    .map(periodKey => ({
      label: formatMessage({ id: `ui-organizations.integration.scheduling.schedulePeriod.${periodKey}` }),
      value: SCHEDULE_PERIODS[periodKey],
    }));

  const toggleSchedule = ({ target }) => {
    const newState = target.checked;

    change(
      'exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule.enableScheduledExport',
      newState,
    );
    change(
      'exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule.scheduleParameters.schedulePeriod',
      newState ? SCHEDULE_PERIODS.days : 'NONE',
    );
  };

  const changeSchedulePeriod = ({ target }) => {
    change(
      'exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule.scheduleParameters',
      { schedulePeriod: target.value },
    );
  };

  return (
    <Accordion
      id="scheduling"
      label={<FormattedMessage id="ui-organizations.integration.scheduling" />}
    >
      <Row>
        <Col xs={3}>
          <Field
            component={Checkbox}
            type="checkbox"
            fullWidth
            label={<FormattedMessage id={scheduleLabelId} />}
            name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule.enableScheduledExport"
            vertical
            onChange={toggleSchedule}
          />
        </Col>

        {
          isScheduleEnabled && (
            <Col xs={3}>
              <Field
                data-testid="schedule-period"
                label={<FormattedMessage id="ui-organizations.integration.scheduling.schedulePeriod" />}
                name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule.scheduleParameters.schedulePeriod"
                component={Select}
                dataOptions={schedulePeriodOptions}
                onChange={changeSchedulePeriod}
                required
                validate={validatePeriod}
              />
            </Col>
          )
        }
      </Row>

      {
        schedulePeriod === SCHEDULE_PERIODS.hours && (
          <Row>
            <Col xs={3}>
              <Field
                data-testid="schedule-hour-frequency"
                component={TextField}
                label={<FormattedMessage id="ui-organizations.integration.scheduling.scheduleFrequency" />}
                name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule.scheduleParameters.scheduleFrequency"
                type="number"
                min={MIN_REQUIRED_NUMBER}
                hasClearIcon={false}
                required
                validate={validateRequiredPositiveNumber}
                parse={normalizeNumber}
              />
            </Col>

            <Col xs={3}>
              <Field
                data-testid="schedule-hour-time"
                label={<FormattedMessage id="ui-organizations.integration.scheduling.scheduleTime" />}
                name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule.scheduleParameters.scheduleTime"
                component={Timepicker}
                required
                validate={validateRequired}
              />
            </Col>
          </Row>
        )
      }

      {
        schedulePeriod === SCHEDULE_PERIODS.days && (
          <Row>
            <Col xs={3}>
              <Field
                data-testid="schedule-frequency"
                component={TextField}
                label={<FormattedMessage id="ui-organizations.integration.scheduling.scheduleFrequency" />}
                name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule.scheduleParameters.scheduleFrequency"
                type="number"
                min={MIN_REQUIRED_NUMBER}
                hasClearIcon={false}
                required
                validate={validateRequiredPositiveNumber}
                parse={normalizeNumber}
              />
            </Col>

            <Col xs={3}>
              <Field
                label={<FormattedMessage id="ui-organizations.integration.scheduling.scheduleDate" />}
                name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule.scheduleParameters.schedulingDate"
                component={Datepicker}
                validateFields={[]}
              />
            </Col>

            <Col xs={3}>
              <Field
                label={<FormattedMessage id="ui-organizations.integration.scheduling.scheduleTime" />}
                name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule.scheduleParameters.scheduleTime"
                component={Timepicker}
                required
                validate={validateRequired}
              />
            </Col>
          </Row>
        )
      }

      {
        schedulePeriod === SCHEDULE_PERIODS.weeks && (
          <Row>
            <Col xs={3}>
              <Field
                data-testid="schedule-week-frequency"
                component={TextField}
                label={<FormattedMessage id="ui-organizations.integration.scheduling.scheduleFrequency" />}
                name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule.scheduleParameters.scheduleFrequency"
                type="number"
                min={MIN_REQUIRED_NUMBER}
                hasClearIcon={false}
                required
                validate={validateRequiredPositiveNumber}
                parse={normalizeNumber}
              />
            </Col>

            <Col xs={3}>
              <Field
                data-testid="schedule-week-time"
                label={<FormattedMessage id="ui-organizations.integration.scheduling.scheduleTime" />}
                name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule.scheduleParameters.scheduleTime"
                component={Timepicker}
                required
                validate={validateRequired}
              />
            </Col>

            <Col xs={6}>
              <FieldArray
                name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule.scheduleParameters.weekDays"
                validate={validateRequired}
              >
                {
                  ({ fields }) => WEEKDAYS.map((weekday, index) => (
                    <Field
                      key={index}
                      component={Checkbox}
                      label={<FormattedMessage id={`ui-organizations.integration.scheduling.scheduleWeekdays.${weekday}`} />}
                      name={`${fields.name}[${weekday}]`}
                      type="checkbox"
                      vertical
                    />
                  ))
                }
              </FieldArray>
            </Col>
          </Row>
        )
      }

      {
        schedulePeriod === SCHEDULE_PERIODS.months && (
          <Row>
            <Col xs={3}>
              <Field
                data-testid="schedule-frequency"
                component={TextField}
                label={<FormattedMessage id="ui-organizations.integration.scheduling.scheduleDay" />}
                name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule.scheduleParameters.scheduleDay"
                type="number"
                min={MIN_REQUIRED_NUMBER}
                max={MAX_DAYS_OF_MONTHLY_SCHEDULE}
                hasClearIcon={false}
                required
                validate={validateRequiredMinAndMaxNumber}
                parse={normalizeNumber}
              />
            </Col>

            <Col xs={3}>
              <Field
                label={<FormattedMessage id="ui-organizations.integration.scheduling.scheduleTime" />}
                name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule.scheduleParameters.scheduleTime"
                component={Timepicker}
                required
                validate={validateRequired}
              />
            </Col>
          </Row>
        )
      }
    </Accordion>
  );
};
