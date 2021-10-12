import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import App from '../renderer/App';

describe('App', () => {
  it('should render', () => {
    const emptyData = {
      left: [] as any[],
      right: [] as any[],
    };
    expect(render(<App players={emptyData} />)).toBeTruthy();
  });
});
