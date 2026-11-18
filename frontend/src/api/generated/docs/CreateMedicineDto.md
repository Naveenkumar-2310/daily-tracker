# CreateMedicineDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [default to undefined]
**strength** | **string** |  | [default to undefined]
**dosageForm** | **string** |  | [optional] [default to 'Tablet']
**scheduleSlot** | **string** |  | [default to undefined]
**reminderTime** | **string** |  | [default to undefined]
**foodRelation** | **string** |  | [optional] [default to FoodRelationEnum_AfterFood]
**currentStock** | **number** |  | [optional] [default to 30]
**lowStockAlert** | **number** |  | [optional] [default to 5]

## Example

```typescript
import { CreateMedicineDto } from './api';

const instance: CreateMedicineDto = {
    name,
    strength,
    dosageForm,
    scheduleSlot,
    reminderTime,
    foodRelation,
    currentStock,
    lowStockAlert,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
