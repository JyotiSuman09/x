import { useLocalSearchParams } from 'expo-router';
import ItemFormScreen from '../../components/ItemFormScreen';

export default function EditItemRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ItemFormScreen itemId={id} />;
}
