import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useResetPassword,
  useDeleteUser,
  type UserAccount,
} from '@/hooks/useData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UserCog,
  Plus,
  Pencil,
  KeyRound,
  Trash2,
  Shield,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import { m } from '@/paraglide/messages';

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const resetPasswordMutation = useResetPassword();
  const deleteMutation = useDeleteUser();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'TEACHER'>('TEACHER');

  const handleOpenCreate = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('TEACHER');
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (u: UserAccount) => {
    setSelectedUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setIsEditOpen(true);
  };

  const handleOpenReset = (u: UserAccount) => {
    setSelectedUser(u);
    setPassword('');
    setIsResetOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error('تمام فیلدها الزامی هستند');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      toast.success('کاربر جدید با موفقیت ایجاد شد');
      setIsCreateOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedUser.id,
        name: name.trim(),
        email: email.trim(),
        role,
      });
      toast.success('اطلاعات کاربر با موفقیت ویرایش شد');
      setIsEditOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !password) return;

    try {
      await resetPasswordMutation.mutateAsync({
        id: selectedUser.id,
        password,
      });
      toast.success('رمز عبور کاربر با موفقیت بازنشانی شد');
      setIsResetOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
    }
  };

  const handleDelete = async (u: UserAccount) => {
    if (u.id === currentUser?.id) {
      toast.error('شما نمی‌توانید حساب خود را حذف کنید');
      return;
    }

    if (!confirm(`آیا از حذف حساب "${u.name}" (${u.email}) اطمینان دارید؟`)) return;

    try {
      await deleteMutation.mutateAsync(u.id);
      toast.success('کاربر با موفقیت حذف شد');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
            <UserCog className="h-6 w-6 text-primary" />
            <span>{m.nav_users()}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            مدیریت حساب‌های کاربری اساتید و مدیران سیستم
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="font-bold gap-2 w-full sm:w-auto h-11 sm:h-9">
          <Plus className="h-4 w-4" />
          <span>{m.btn_new_user()}</span>
        </Button>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">در حال بارگذاری کاربران...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {users.map((u) => {
            const isSelf = u.id === currentUser?.id;
            return (
              <Card key={u.id} className="shadow-xs hover:border-primary/40 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="font-bold text-base text-foreground flex items-center gap-2">
                        <span>{u.name}</span>
                        {isSelf && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-medium">
                            حساب شما
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>

                    <Badge
                      variant={u.role === 'ADMIN' ? 'default' : 'secondary'}
                      className="text-xs gap-1 font-semibold"
                    >
                      {u.role === 'ADMIN' ? (
                        <>
                          <Shield className="h-3 w-3" />
                          <span>{m.role_admin()}</span>
                        </>
                      ) : (
                        <>
                          <GraduationCap className="h-3 w-3" />
                          <span>{m.role_teacher()}</span>
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenReset(u)}
                      className="h-9 px-2.5 sm:h-8 sm:px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <KeyRound className="h-3.5 w-3.5 me-1" />
                      <span>تغییر رمز</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(u)}
                      className="h-9 px-2.5 sm:h-8 sm:px-2 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5 me-1" />
                      <span>{m.btn_edit()}</span>
                    </Button>
                    {!isSelf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(u)}
                        className="h-9 px-2.5 sm:h-8 sm:px-2 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">{m.btn_new_user()}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="createName" className="text-xs font-semibold">
                  نام و نام‌خانوادگی *
                </Label>
                <Input
                  id="createName"
                  placeholder="مثال: سارا محمدی"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="createEmail" className="text-xs font-semibold">
                  ایمیل (نام کاربری ورود) *
                </Label>
                <Input
                  id="createEmail"
                  type="email"
                  placeholder="sara@bytic.ir"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="createPassword" className="text-xs font-semibold">
                  رمز عبور اولیه *
                </Label>
                <Input
                  id="createPassword"
                  type="password"
                  placeholder="حداقل ۶ کاراکتر"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">نقش کاربری *</Label>
                <Select
                  value={role}
                  onValueChange={(val: 'ADMIN' | 'TEACHER') => setRole(val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEACHER">{m.role_teacher()} (دسترسی به کلاس‌های خود)</SelectItem>
                    <SelectItem value="ADMIN">{m.role_admin()} (دسترسی کامل)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                {m.btn_cancel()}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {m.btn_save()}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">ویرایش اطلاعات کاربر</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="editName" className="text-xs font-semibold">
                  نام و نام‌خانوادگی
                </Label>
                <Input
                  id="editName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editEmail" className="text-xs font-semibold">
                  ایمیل
                </Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">نقش کاربری</Label>
                <Select
                  value={role}
                  onValueChange={(val: 'ADMIN' | 'TEACHER') => setRole(val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEACHER">{m.role_teacher()}</SelectItem>
                    <SelectItem value="ADMIN">{m.role_admin()}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                {m.btn_cancel()}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {m.btn_save()}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleResetPassword}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">بازنشانی رمز عبور: {selectedUser?.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="resetPassword" className="text-xs font-semibold">
                  رمز عبور جدید
                </Label>
                <Input
                  id="resetPassword"
                  type="password"
                  placeholder="حداقل ۶ کاراکتر"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  autoFocus
                  required
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsResetOpen(false)}>
                {m.btn_cancel()}
              </Button>
              <Button type="submit" disabled={resetPasswordMutation.isPending}>
                ثبت رمز عبور جدید
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
