import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { renderHook } from '@folio/jest-config-stripes/testing-library/react';

import { useOkapiKy } from '@folio/stripes/core';

import {
  SCHEDULE_PERIODS,
  TRANSMISSION_METHOD,
} from '../../../OrganizationIntegration/constants';
import { useIntegrationConfigMutation } from './useIntegrationConfigMutation';

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useIntegrationConfigMutation', () => {
  it('should make post request when id is not provided', async () => {
    const postMock = jest.fn();

    useOkapiKy.mockClear().mockReturnValue({
      post: postMock,
    });

    const { result } = renderHook(
      () => useIntegrationConfigMutation(),
      { wrapper },
    );

    await result.current.mutateIntegrationConfig({
      schedulePeriod: 'NONE',
      exportTypeSpecificParameters: {
        vendorEdiOrdersExportConfig: {
          vendorId: 'orgId',
        },
      },
    });

    expect(postMock).toHaveBeenCalled();
  });

  it('should make put request when id is provided', async () => {
    const putMock = jest.fn();

    useOkapiKy.mockClear().mockReturnValue({
      put: putMock,
    });

    const { result } = renderHook(
      () => useIntegrationConfigMutation(),
      { wrapper },
    );

    await result.current.mutateIntegrationConfig({
      id: 1,
      schedulePeriod: 'NONE',
      exportTypeSpecificParameters: {
        vendorEdiOrdersExportConfig: {
          vendorId: 'orgId',
          ediSchedule: {
            scheduleParameters: {
              schedulePeriod: SCHEDULE_PERIODS.weeks,
              scheduleTime: '00:00:00.00Z',
              weekDays: { MONDAY: true },
            },
          },
        },
      },
    });

    expect(putMock).toHaveBeenCalled();
  });

  it('should make delete request when \'delete\' method is specified in options', async () => {
    const deleteMock = jest.fn();

    useOkapiKy.mockClear().mockReturnValue({
      put: deleteMock,
    });

    const { result } = renderHook(
      () => useIntegrationConfigMutation(),
      { wrapper },
    );

    await result.current.mutateIntegrationConfig({
      id: 1,
      method: 'delete',
    });

    expect(deleteMock).toHaveBeenCalled();
  });

  describe('Transmission method', () => {
    const buildConfig = (transmissionMethod) => ({
      exportTypeSpecificParameters: {
        vendorEdiOrdersExportConfig: {
          transmissionMethod,
          ediConfig: { accountNoList: ['123'] },
          ediFtp: { ftpPort: '21' },
          ediEmail: { emailFrom: 'orders@library.org' },
        },
      },
    });

    const mutate = async (config) => {
      const postMock = jest.fn();

      useOkapiKy.mockClear().mockReturnValue({ post: postMock });

      const { result } = renderHook(() => useIntegrationConfigMutation(), { wrapper });

      await result.current.mutateIntegrationConfig(config);

      return postMock.mock.calls[0][1].json.exportTypeSpecificParameters.vendorEdiOrdersExportConfig;
    };

    it('should drop the FTP settings of an email integration and keep the EDI config', async () => {
      const vendorConfig = await mutate(buildConfig(TRANSMISSION_METHOD.email));

      expect(vendorConfig.ediFtp).toBeUndefined();
      expect(vendorConfig.ediEmail).toEqual({ emailFrom: 'orders@library.org' });
      expect(vendorConfig.ediConfig).toEqual({ accountNoList: ['123'] });
    });

    it('should drop the email settings of an FTP integration', async () => {
      const vendorConfig = await mutate(buildConfig(TRANSMISSION_METHOD.ftp));

      expect(vendorConfig.ediEmail).toBeUndefined();
      expect(vendorConfig.ediFtp).toEqual({ ftpPort: '21' });
    });
  });
});
