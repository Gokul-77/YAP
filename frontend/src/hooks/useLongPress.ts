import { useCallback, useRef, useState } from 'react';

interface LongPressOptions {
    threshold?: number;
    onStart?: () => void;
    onFinish?: () => void;
    onCancel?: () => void;
}

export function useLongPress(
    callback: () => void,
    { threshold = 500, onStart, onFinish, onCancel }: LongPressOptions = {}
) {
    const [isPressed, setIsPressed] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isLongPress = useRef(false);

    const start = useCallback(() => {
        if (onStart) onStart();
        setIsPressed(true);
        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            callback();
        }, threshold);
    }, [callback, threshold, onStart]);

    const stop = useCallback(() => {
        if (onFinish) onFinish();
        setIsPressed(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, [onFinish]);

    const cancel = useCallback(() => {
        if (onCancel) onCancel();
        setIsPressed(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, [onCancel]);

    return {
        onMouseDown: start,
        onMouseUp: stop,
        onMouseLeave: cancel,
        onTouchStart: start,
        onTouchEnd: stop,
        onTouchCancel: cancel,
    };
}
