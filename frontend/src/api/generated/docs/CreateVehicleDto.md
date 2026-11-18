# CreateVehicleDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [default to undefined]
**registrationNumber** | **string** |  | [optional] [default to undefined]
**expectedMileage** | **number** |  | [default to undefined]
**fuelTankCapacity** | **number** |  | [optional] [default to undefined]
**initialOdometerKm** | **number** |  | [optional] [default to 0]

## Example

```typescript
import { CreateVehicleDto } from './api';

const instance: CreateVehicleDto = {
    name,
    registrationNumber,
    expectedMileage,
    fuelTankCapacity,
    initialOdometerKm,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
