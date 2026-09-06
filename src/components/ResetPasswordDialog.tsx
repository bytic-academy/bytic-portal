import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, KeyRound, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useResetPassword } from '@/hooks/useData';
import { m } from '@/paraglide/messages';

export interface ResetPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    name: string;
    email?: string;
  } | null;
  isSelf: boolean;
  onSuccess?: () => void;
}

const COMPLEXITY_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)/;

export function ResetPasswordDialog({
  isOpen,
  onClose,
  targetUser,
  isSelf,
  onSuccess,
}: ResetPasswordDialogProps) {
  const resetPasswordMutation = useResetPassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Reset form when dialog opens or target changes
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [isOpen, targetUser]);

  if (!targetUser) return null;

  const isMinLength = newPassword.length >= 8;
  const isComplex = COMPLEXITY_REGEX.test(newPassword);
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;
  const isCurrentValid = !isSelf || currentPassword.length > 0;
  const isValid = isMinLength && isComplex && isMatching && isCurrentValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSelf && !currentPassword.trim()) {
      toast.error('رمز عبور فعلی الزامی است');
      return;
    }

    if (!isMinLength) {
      toast.error('رمز عبور باید حداقل ۸ کاراکتر باشد');
      return;
    }

    if (!isComplex) {
      toast.error('رمز عبور باید شامل حروف و اعداد باشد');
      return;
    }

    if (!isMatching) {
      toast.error('رمز عبور جدید با تکرار آن یکسان نیست');
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        id: targetUser.id,
        password: newPassword,
        currentPassword: isSelf ? currentPassword : undefined,
      });

      toast.success(
        isSelf
          ? 'رمز عبور شما با موفقیت تغییر یافت'
          : `رمز عبور کاربر "${targetUser.name}" با موفقیت بازنشانی شد`
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <KeyRound className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold">
                {isSelf ? 'تغییر رمز عبور' : `بازنشانی رمز عبور: ${targetUser.name}`}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              {isSelf
                ? 'برای تغییر رمز عبور حساب خود، رمز فعلی و رمز عبور جدید را وارد کنید.'
                : `تنظیم رمز عبور جدید برای ${targetUser.name}${targetUser.email ? ` (${targetUser.email})` : ''}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-4">
            {/* Current Password (Self only) */}
            {isSelf && (
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs font-semibold">
                  رمز عبور فعلی *
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="رمز عبور فعلی خود را وارد کنید"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    dir="ltr"
                    className="pe-10 font-mono text-sm"
                    autoFocus
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute end-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                    aria-label={showCurrent ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {/* New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs font-semibold">
                رمز عبور جدید *
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  placeholder="حداقل ۸ کاراکتر شامل حروف و اعداد"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  dir="ltr"
                  className="pe-10 font-mono text-sm"
                  autoFocus={!isSelf}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute end-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {/* Password complexity indicators */}
              {newPassword.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                  <span
                    className={`inline-flex items-center gap-1 font-medium ${
                      isMinLength ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                    }`}
                  >
                    {isMinLength ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    حداقل ۸ کاراکتر
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-medium ${
                      isComplex ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                    }`}
                  >
                    {isComplex ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    شامل حروف و اعداد
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold">
                تکرار رمز عبور جدید *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="رمز عبور جدید را مجدداً وارد کنید"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  dir="ltr"
                  className="pe-10 font-mono text-sm"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute end-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {confirmPassword.length > 0 && !isMatching && (
                <p className="text-[11px] text-destructive flex items-center gap-1 font-medium pt-0.5">
                  <AlertCircle className="h-3 w-3" />
                  رمز عبور جدید با تکرار آن مطابقت ندارد
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={resetPasswordMutation.isPending}>
              {m.btn_cancel()}
            </Button>
            <Button type="submit" disabled={!isValid || resetPasswordMutation.isPending}>
              {resetPasswordMutation.isPending ? 'در حال ثبت...' : 'ثبت رمز عبور جدید'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
