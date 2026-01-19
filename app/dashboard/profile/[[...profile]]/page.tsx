import ProfileViewPage from '@/views/dashboard/profile/profile-view-page';
import { APP_TEXTS } from '@/lib/constants';

export const metadata = {
  title: APP_TEXTS.profile.title
};

export default async function Page() {
  return <ProfileViewPage />;
}
