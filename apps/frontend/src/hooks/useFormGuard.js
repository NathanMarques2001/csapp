import { useEffect, useMemo, useCallback, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { useConfirm } from '../context/ConfirmContext';
import { useGoBack } from '../context/NavigationContext';
import { confirmPresets } from '../utils/confirmPresets';

const serialize = (value) => JSON.stringify(value);

export function useFormGuard({
    formData,
    baseline,
    enabled = true,
    fallback = '/dashboard',
    entityLabel = 'este registro',
    isCreate = false,
}) {
    const { confirm } = useConfirm();
    const goBack = useGoBack(fallback);
    const [isSaved, setIsSaved] = useState(false);

    const isDirty = useMemo(() => {
        if (!enabled || isSaved || baseline == null) return false;
        return serialize(formData) !== serialize(baseline);
    }, [formData, baseline, enabled, isSaved]);

    const blocker = useBlocker(
        useCallback(
            ({ currentLocation, nextLocation }) =>
                isDirty && currentLocation.pathname !== nextLocation.pathname,
            [isDirty]
        )
    );

    useEffect(() => {
        if (blocker.state !== 'blocked') return;

        let active = true;
        (async () => {
            const canLeave = await confirm(confirmPresets.discardChanges());
            if (!active) return;
            if (canLeave) blocker.proceed();
            else blocker.reset();
        })();

        return () => {
            active = false;
        };
    }, [blocker.state, blocker, confirm]);

    useEffect(() => {
        if (!isDirty) return undefined;
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const confirmSave = useCallback(async () => {
        return confirm(confirmPresets.save(entityLabel, isCreate));
    }, [confirm, entityLabel, isCreate]);

    const confirmLeave = useCallback(async () => {
        if (!isDirty) return true;
        return confirm(confirmPresets.discardChanges());
    }, [confirm, isDirty]);

    const requestLeave = useCallback(async () => {
        const canLeave = await confirmLeave();
        if (canLeave) goBack();
    }, [confirmLeave, goBack]);

    const onSaveSuccess = useCallback(() => {
        setIsSaved(true);
    }, []);

    return { isDirty, confirmSave, confirmLeave, requestLeave, onSaveSuccess };
}

export function useModalGuard({ formData, baseline, onClose, entityLabel = 'este registro', isCreate = false }) {
    const { confirm } = useConfirm();

    const isDirty = useMemo(() => {
        if (baseline == null) return false;
        return serialize(formData) !== serialize(baseline);
    }, [formData, baseline]);

    const handleClose = useCallback(async () => {
        if (isDirty && !(await confirm(confirmPresets.discardChanges()))) return;
        onClose();
    }, [isDirty, confirm, onClose]);

    const confirmSave = useCallback(async () => {
        return confirm(confirmPresets.save(entityLabel, isCreate));
    }, [confirm, entityLabel, isCreate]);

    return { isDirty, handleClose, confirmSave };
}
