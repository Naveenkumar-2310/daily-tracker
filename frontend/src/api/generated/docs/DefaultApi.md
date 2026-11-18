# DefaultApi

All URIs are relative to *http://localhost:5001*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**analyzeOcrText**](#analyzeocrtext) | **POST** /api/v1/ocr/analyze-text | Parse extracted text for odometer numbers and date patterns|
|[**createFuelLog**](#createfuellog) | **POST** /api/v1/fuel-logs | Log a refuel event and compute mileage against benchmark|
|[**createMedicine**](#createmedicine) | **POST** /api/v1/medicines | Register a new prescription|
|[**createVehicle**](#createvehicle) | **POST** /api/v1/vehicles | Register a new vehicle profile|
|[**deleteFuelLog**](#deletefuellog) | **DELETE** /api/v1/fuel-logs/{id} | Delete a fuel log entry|
|[**deleteMedicine**](#deletemedicine) | **DELETE** /api/v1/medicines/{id} | Delete prescription|
|[**deleteVehicle**](#deletevehicle) | **DELETE** /api/v1/vehicles/{id} | Delete vehicle|
|[**getCalendarMonth**](#getcalendarmonth) | **GET** /api/v1/pill-logs/calendar | Get month calendar matrix with adherence dots|
|[**getFuelAnalytics**](#getfuelanalytics) | **GET** /api/v1/fuel-logs/analytics/{vehicleId} | Get aggregate fuel and mileage analytics for a vehicle|
|[**getFuelHistory**](#getfuelhistory) | **GET** /api/v1/fuel-logs/history | Get history of refuel entries|
|[**getHealth**](#gethealth) | **GET** /health | Service health check|
|[**getMedicineById**](#getmedicinebyid) | **GET** /api/v1/medicines/{id} | Get prescription by ID|
|[**getMedicines**](#getmedicines) | **GET** /api/v1/medicines | Get all prescriptions in directory|
|[**getPillStats**](#getpillstats) | **GET** /api/v1/pill-logs/stats | Get overall adherence streak statistics|
|[**getTodayPillStatus**](#gettodaypillstatus) | **GET** /api/v1/pill-logs/today | Get scheduled medications and status for a specific date|
|[**getVehicleById**](#getvehiclebyid) | **GET** /api/v1/vehicles/{id} | Get vehicle profile by ID|
|[**getVehicles**](#getvehicles) | **GET** /api/v1/vehicles | Get all registered vehicles|
|[**markPillDose**](#markpilldose) | **POST** /api/v1/pill-logs/mark | Mark dose as taken, missed, or skipped|
|[**updateMedicine**](#updatemedicine) | **PUT** /api/v1/medicines/{id} | Update prescription details|
|[**updateVehicle**](#updatevehicle) | **PUT** /api/v1/vehicles/{id} | Update vehicle profile|

# **analyzeOcrText**
> AnalyzeOcrText200Response analyzeOcrText(analyzeOcrTextRequest)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    AnalyzeOcrTextRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let analyzeOcrTextRequest: AnalyzeOcrTextRequest; //

const { status, data } = await apiInstance.analyzeOcrText(
    analyzeOcrTextRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **analyzeOcrTextRequest** | **AnalyzeOcrTextRequest**|  | |


### Return type

**AnalyzeOcrText200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Detected odometer and date |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createFuelLog**
> CreateFuelLog201Response createFuelLog(createFuelLogDto)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    CreateFuelLogDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let createFuelLogDto: CreateFuelLogDto; //

const { status, data } = await apiInstance.createFuelLog(
    createFuelLogDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createFuelLogDto** | **CreateFuelLogDto**|  | |


### Return type

**CreateFuelLog201Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Fuel log saved with mileage analysis |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createMedicine**
> CreateMedicine201Response createMedicine(createMedicineDto)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    CreateMedicineDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let createMedicineDto: CreateMedicineDto; //

const { status, data } = await apiInstance.createMedicine(
    createMedicineDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createMedicineDto** | **CreateMedicineDto**|  | |


### Return type

**CreateMedicine201Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Medicine registered |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createVehicle**
> CreateVehicle201Response createVehicle(createVehicleDto)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    CreateVehicleDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let createVehicleDto: CreateVehicleDto; //

const { status, data } = await apiInstance.createVehicle(
    createVehicleDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createVehicleDto** | **CreateVehicleDto**|  | |


### Return type

**CreateVehicle201Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Vehicle registered |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteFuelLog**
> DeleteMedicine200Response deleteFuelLog()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deleteFuelLog(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**DeleteMedicine200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Deletion result |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteMedicine**
> DeleteMedicine200Response deleteMedicine()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deleteMedicine(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**DeleteMedicine200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Deletion result |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteVehicle**
> DeleteMedicine200Response deleteVehicle()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deleteVehicle(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**DeleteMedicine200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Deletion result |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCalendarMonth**
> GetCalendarMonth200Response getCalendarMonth()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let month: string; // (optional) (default to undefined)
let medicineId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getCalendarMonth(
    month,
    medicineId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **month** | [**string**] |  | (optional) defaults to undefined|
| **medicineId** | [**string**] |  | (optional) defaults to undefined|


### Return type

**GetCalendarMonth200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Calendar adherence mapping |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getFuelAnalytics**
> GetFuelAnalytics200Response getFuelAnalytics()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let vehicleId: string; // (default to undefined)

const { status, data } = await apiInstance.getFuelAnalytics(
    vehicleId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **vehicleId** | [**string**] |  | defaults to undefined|


### Return type

**GetFuelAnalytics200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Analytics summary |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getFuelHistory**
> GetFuelHistory200Response getFuelHistory()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let vehicleId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getFuelHistory(
    vehicleId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **vehicleId** | [**string**] |  | (optional) defaults to undefined|


### Return type

**GetFuelHistory200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of refuel logs |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getHealth**
> GetHealth200Response getHealth()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.getHealth();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GetHealth200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Health status |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMedicineById**
> CreateMedicine201Response getMedicineById()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.getMedicineById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**CreateMedicine201Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Prescription details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMedicines**
> GetMedicines200Response getMedicines()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let active: boolean; // (optional) (default to undefined)

const { status, data } = await apiInstance.getMedicines(
    active
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **active** | [**boolean**] |  | (optional) defaults to undefined|


### Return type

**GetMedicines200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of medicines |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPillStats**
> GetPillStats200Response getPillStats()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let medicineId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getPillStats(
    medicineId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **medicineId** | [**string**] |  | (optional) defaults to undefined|


### Return type

**GetPillStats200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Streak and percentage metrics |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getTodayPillStatus**
> GetTodayPillStatus200Response getTodayPillStatus()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let date: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getTodayPillStatus(
    date
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **date** | [**string**] |  | (optional) defaults to undefined|


### Return type

**GetTodayPillStatus200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Intake schedule for date |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getVehicleById**
> CreateVehicle201Response getVehicleById()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.getVehicleById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**CreateVehicle201Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Vehicle details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getVehicles**
> GetVehicles200Response getVehicles()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let active: boolean; // (optional) (default to undefined)

const { status, data } = await apiInstance.getVehicles(
    active
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **active** | [**boolean**] |  | (optional) defaults to undefined|


### Return type

**GetVehicles200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of vehicles |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **markPillDose**
> DeleteMedicine200Response markPillDose(markPillDto)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    MarkPillDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let markPillDto: MarkPillDto; //

const { status, data } = await apiInstance.markPillDose(
    markPillDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **markPillDto** | **MarkPillDto**|  | |


### Return type

**DeleteMedicine200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated log entry |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateMedicine**
> CreateMedicine201Response updateMedicine(updateMedicineDto)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    UpdateMedicineDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; // (default to undefined)
let updateMedicineDto: UpdateMedicineDto; //

const { status, data } = await apiInstance.updateMedicine(
    id,
    updateMedicineDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateMedicineDto** | **UpdateMedicineDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**CreateMedicine201Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated prescription |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateVehicle**
> CreateVehicle201Response updateVehicle(updateVehicleDto)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    UpdateVehicleDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; // (default to undefined)
let updateVehicleDto: UpdateVehicleDto; //

const { status, data } = await apiInstance.updateVehicle(
    id,
    updateVehicleDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateVehicleDto** | **UpdateVehicleDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**CreateVehicle201Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated vehicle |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

