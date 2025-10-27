import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getSession, getUserById, clearSession, updateLastActivity } from '@/lib/storage';
import { getDeviceInfo } from '@/lib/device';
import { ArrowLeft, User, Mail, Phone, Smartphone, Shield, LogOut, CheckCircle, XCircle } from 'lucide-react';
import type { User as UserType } from '@/lib/storage';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const session = getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const userData = getUserById(session.userId);
      if (userData) {
        setUser(userData);
      }

      const info = await getDeviceInfo();
      setDeviceInfo(info);
      updateLastActivity();
    };

    loadData();
  }, [navigate]);

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pb-24">
      <div className="p-4 bg-gradient-to-r from-primary to-primary-light text-primary-foreground rounded-b-[2rem] shadow-[var(--shadow-elevated)]">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4 text-primary-foreground hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-4">
            <User className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold mb-1">{user.fullName}</h1>
          <div className="flex items-center justify-center gap-2">
            {user.isVerified ? (
              <>
                <CheckCircle className="w-4 h-4 text-success" />
                <p className="text-sm">Verified Account</p>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-warning" />
                <p className="text-sm">Pending Verification</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Account Information */}
        <Card className="p-4">
          <h2 className="text-lg font-bold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium">{user.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Device Information */}
        <Card className="p-4">
          <h2 className="text-lg font-bold mb-4">Device Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Device ID</p>
                <p className="font-medium font-mono text-xs">{user.deviceId}</p>
              </div>
            </div>

            {deviceInfo && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Platform</p>
                    <p className="font-medium capitalize">{deviceInfo.platform}</p>
                  </div>
                </div>

                {deviceInfo.model && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Device Model</p>
                      <p className="font-medium">{deviceInfo.model}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Verification Status */}
        {!user.isVerified && (
          <Card className="p-4 bg-warning/10 border-warning">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-warning mt-1" />
              <div>
                <p className="font-medium text-warning mb-1">Account Pending Verification</p>
                <p className="text-sm text-muted-foreground">
                  Your device is pending admin verification. You will be able to access all features once verified.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full h-12"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Profile;
