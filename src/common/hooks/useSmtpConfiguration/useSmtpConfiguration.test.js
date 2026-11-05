import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';

import { useOkapiKy } from '@folio/stripes/core';

import { useSmtpConfiguration } from './useSmtpConfiguration';

const queryClient = new QueryClient();

const SMTP_CONFIGURATION = {
  from: 'orders@library.org',
  identities: [{ address: 'acq@library.org', name: 'Acquisitions' }],
};

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useSmtpConfiguration', () => {
  const kyGet = jest.fn();

  beforeEach(() => {
    kyGet.mockClear().mockReturnValue({
      json: () => Promise.resolve({ settings: [{ value: SMTP_CONFIGURATION }] }),
    });
    useOkapiKy.mockClear().mockReturnValue({ get: kyGet });
  });

  it('should return the SMTP configuration from the email settings', async () => {
    const { result } = renderHook(() => useSmtpConfiguration(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(kyGet).toHaveBeenCalledWith('email/settings', expect.anything());
    expect(result.current.smtpConfiguration).toEqual(SMTP_CONFIGURATION);
  });
});
