import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFocusManagement } from '@/src/hooks/useFocusManagement';

describe('useFocusManagement', () => {
  it('returns setTriggerRef and setContainerRef when closed', () => {
    const { result } = renderHook(() => useFocusManagement(false));

    expect(result.current.setTriggerRef).toBeInstanceOf(Function);
    expect(result.current.setContainerRef).toBeInstanceOf(Function);
    expect(result.current.containerRef).toBeDefined();
  });

  it('returns setTriggerRef and setContainerRef when open', () => {
    const { result } = renderHook(() => useFocusManagement(true));

    expect(result.current.setTriggerRef).toBeInstanceOf(Function);
    expect(result.current.setContainerRef).toBeInstanceOf(Function);
  });

  it('containerRef is null initially', () => {
    const { result } = renderHook(() => useFocusManagement(false));
    expect(result.current.containerRef.current).toBeNull();
  });

  it('setContainerRef updates the ref', () => {
    const { result } = renderHook(() => useFocusManagement(false));
    const div = document.createElement('div');

    act(() => {
      result.current.setContainerRef(div);
    });

    expect(result.current.containerRef.current).toBe(div);
  });

  it('setContainerRef sets ref to null', () => {
    const { result } = renderHook(() => useFocusManagement(false));
    const div = document.createElement('div');

    act(() => {
      result.current.setContainerRef(div);
    });
    act(() => {
      result.current.setContainerRef(null);
    });

    expect(result.current.containerRef.current).toBeNull();
  });
});
