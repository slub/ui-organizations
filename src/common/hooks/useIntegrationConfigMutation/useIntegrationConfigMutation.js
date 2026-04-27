import {
  useMutation,
} from 'react-query';
import { cloneDeep } from 'lodash';

import { useOkapiKy, useStripes } from '@folio/stripes/core';

import { SCHEDULE_PERIODS, TRANSMISSION_METHOD } from '../../../OrganizationIntegration/constants';
import { getSchedulingDatetime } from '../../../OrganizationIntegration/utils';

export const useIntegrationConfigMutation = (options = {}) => {
  const ky = useOkapiKy();
  const stripes = useStripes();

  const { mutateAsync } = useMutation({
    mutationFn: (integrationConfig) => {
      const json = cloneDeep(integrationConfig);
      const vendorConfig = json.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig;

      if (vendorConfig) {
        if (vendorConfig.transmissionMethod === TRANSMISSION_METHOD.email) {
          // Keep ediConfig: it carries the matching layer (defaultAcquisitionMethods,
          // accountNoList) which applies to all transmission methods, not just EDI.
          delete vendorConfig.ediFtp;
        } else {
          delete vendorConfig.ediEmail;
        }
      }

      const scheduleParameters = json
        .exportTypeSpecificParameters
        ?.vendorEdiOrdersExportConfig
        ?.ediSchedule
        ?.scheduleParameters;

      if (scheduleParameters?.weekDays) {
        scheduleParameters.weekDays = Object.keys(scheduleParameters.weekDays)
          .filter(weekDay => scheduleParameters.weekDays[weekDay]);
      }

      if (scheduleParameters?.schedulePeriod === SCHEDULE_PERIODS.days && scheduleParameters?.schedulingDate) {
        scheduleParameters.schedulingDate = getSchedulingDatetime({
          date: scheduleParameters.schedulingDate,
          time: scheduleParameters.scheduleTime,
          timezone: stripes.timezone,
        });
      }

      if (scheduleParameters?.scheduleTime) {
        scheduleParameters.scheduleTime = scheduleParameters.scheduleTime.slice(0, 8);
      }

      const kyMethod = options.method ?? (integrationConfig.id ? 'put' : 'post');
      const kyPath = integrationConfig.id
        ? `data-export-spring/configs/${integrationConfig.id}`
        : 'data-export-spring/configs';

      return ky[kyMethod](kyPath, { json });
    },
    ...options,
  });

  return {
    mutateIntegrationConfig: mutateAsync,
  };
};
