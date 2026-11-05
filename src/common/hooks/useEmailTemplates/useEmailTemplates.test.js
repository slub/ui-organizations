import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';

import { useOkapiKy } from '@folio/stripes/core';

import { useEmailTemplates } from './useEmailTemplates';

const queryClient = new QueryClient();

const TEMPLATE = { id: 'templateId', name: 'Order email', active: true };

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useEmailTemplates', () => {
  const kyGet = jest.fn();

  beforeEach(() => {
    kyGet.mockClear().mockReturnValue({
      json: () => Promise.resolve({ templates: [TEMPLATE] }),
    });
    useOkapiKy.mockClear().mockReturnValue({ get: kyGet });
  });

  it('should fetch the templates of the given scope', async () => {
    const { result } = renderHook(() => useEmailTemplates('orders-email'), { wrapper });

    await waitFor(() => expect(result.current.isLoaded).toBeTruthy());

    expect(kyGet).toHaveBeenCalledWith('templates', expect.objectContaining({
      searchParams: expect.objectContaining({ query: 'scope=="orders-email"' }),
    }));
    expect(result.current.templates).toEqual([TEMPLATE]);
  });
});
