import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import progressService from '../../../services/progressService';
import { DIFFICULTY_LEVELS, MODULES_CONFIG } from '../../../constants/learningModules';
import CertificateModal from './CertificateModal';
import { generateCertificatePdf } from '../utils/certificatePdf';

const LEVEL_META = {
  [DIFFICULTY_LEVELS.BEGINNER]: {
    label: 'Beginner',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-600',
    buttonBg: 'bg-gradient-to-r from-emerald-600 to-green-600',
  },
  [DIFFICULTY_LEVELS.INTERMEDIATE]: {
    label: 'Intermediate',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-600',
    buttonBg: 'bg-gradient-to-r from-green-600 to-emerald-700',
  },
  [DIFFICULTY_LEVELS.ADVANCED]: {
    label: 'Advanced',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-600',
    buttonBg: 'bg-gradient-to-r from-green-600 to-emerald-700',
  },
};

const LEVEL_ORDER = [
  DIFFICULTY_LEVELS.BEGINNER,
  DIFFICULTY_LEVELS.INTERMEDIATE,
  DIFFICULTY_LEVELS.ADVANCED,
];

const getCertificateStorageKey = (userId, level) => `xtin_certificate_${userId}_${level}`;

const getLevelModules = (level) => MODULES_CONFIG.filter(
  (module) => module.difficulty === level && module.available && module.lessons > 0
);

const buildLevelStatus = (progressByModule, level) => {
  const modules = getLevelModules(level);
  const completedModules = modules.filter((module) => {
    const completedLessons = progressByModule[module.id] || [];
    return completedLessons.length >= module.lessons;
  });

  return {
    modules,
    completed: modules.length > 0 && completedModules.length === modules.length,
    completedModulesCount: completedModules.length,
    totalModulesCount: modules.length,
  };
};

const CertificateManager = () => {
  const { user } = useAuth();
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [pendingCertificates, setPendingCertificates] = useState([]);
  const [recipientName, setRecipientName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const isCheckingRef = useRef(false);

  const defaultName = useMemo(() => {
    if (!user) return '';
    return [user.first_name, user.last_name].filter(Boolean).join(' ');
  }, [user]);

  const enqueueCertificates = useCallback((certificates) => {
    if (!certificates.length) return;
    setPendingCertificates((prev) => [...prev, ...certificates]);
  }, []);

  const evaluateCertificates = useCallback(async () => {
    if (!user || isCheckingRef.current) return;
    isCheckingRef.current = true;

    try {
      const progress = await progressService.getUserProgress();
      // No session / no progress yet — nothing to evaluate (fail quiet).
      if (!progress) return;
      const newCertificates = [];

      LEVEL_ORDER.forEach((level) => {
        const status = buildLevelStatus(progress, level);
        if (!status.completed) return;

        const storageKey = getCertificateStorageKey(user.id, level);
        if (localStorage.getItem(storageKey)) return;

        const meta = LEVEL_META[level];
        const issuedAt = new Date().toISOString();
        const certificateId = `XTIN-${level.toUpperCase()}-${issuedAt.slice(0, 10).replace(/-/g, '')}`;

        localStorage.setItem(storageKey, 'shown');

        newCertificates.push({
          level,
          levelLabel: meta.label,
          title: `${meta.label} Course Completion`,
          moduleCount: status.totalModulesCount,
          issuedAt,
          certificateId,
          badgeBg: meta.badgeBg,
          badgeText: meta.badgeText,
          buttonBg: meta.buttonBg,
        });
      });

      enqueueCertificates(newCertificates);
    } catch (error) {
      console.error('Failed to evaluate certificates:', error);
    } finally {
      isCheckingRef.current = false;
    }
  }, [enqueueCertificates, user]);

  useEffect(() => {
    if (!user) return;
    evaluateCertificates();
  }, [user, evaluateCertificates]);

  useEffect(() => {
    if (!user) return;
    const handleProgressMarked = () => evaluateCertificates();
    window.addEventListener('lesson_progress_marked', handleProgressMarked);
    return () => window.removeEventListener('lesson_progress_marked', handleProgressMarked);
  }, [user, evaluateCertificates]);

  useEffect(() => {
    if (!activeCertificate && pendingCertificates.length > 0) {
      const [next, ...rest] = pendingCertificates;
      setPendingCertificates(rest);
      setActiveCertificate(next);
      setRecipientName(defaultName);
      setErrorMessage('');
    }
  }, [activeCertificate, pendingCertificates, defaultName]);

  const handleClose = () => {
    setActiveCertificate(null);
    setRecipientName(defaultName);
    setErrorMessage('');
  };

  const handleDownload = async () => {
    const trimmedName = recipientName.trim();
    if (!trimmedName) {
      setErrorMessage('Please enter your name to generate the certificate.');
      return;
    }

    setIsDownloading(true);
    setErrorMessage('');

    try {
      generateCertificatePdf({
        recipientName: trimmedName,
        levelLabel: activeCertificate.levelLabel,
        issuedAt: activeCertificate.issuedAt,
        certificateId: activeCertificate.certificateId,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <CertificateModal
      certificate={activeCertificate}
      recipientName={recipientName}
      onNameChange={setRecipientName}
      onClose={handleClose}
      onDownload={handleDownload}
      isDownloading={isDownloading}
      errorMessage={errorMessage}
    />
  );
};

export default CertificateManager;
