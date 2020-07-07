# Reprox
Tiny library for easily manage React state and store

## Defination

It is a small library for React state and store management. It uses the **React Hooks** structure and it must be used in **React functional compenents**. 

<details>
<summary><strong>The main features</strong></summary>

* State management for functional components
* Easy data transfer between components and pages
* Two way binding *
* Watching changes on objects and arrays
* Binding objects

</details>

<details>
<summary><strong>Obligations</strong></summary>

* React version must be minimum 16.8.0 
* Functional compenent has to be used for state management
* Browser must support javascript proxies

</details>

---

## Installation
`npm install reprox`

or  

`yarn add reprox`

---

## State Management

Reprox allows you to easily manage the state of components, and move data between components and pages. To do this, as in the example below, import Reprox to your js code and add  `Reprox.useState(key)` into the functional component.

```javascript
import React from 'react';
import Reprox from 'reprox'

export default ()=>{
    Reprox.useSate("unique key");

    return
    (<div>
        <input value={Reprox.MainStore.inputValue} 
        onChange={(event)=> Reprox.MainStore.inputValue = event.target.value}>
        </input>
        <span>{"you are writing: " + Reprox.MainStore.inputValue}</span>
    </div>)
}
```
The sample code above shows the use of Reprox in its most basic form. You don't need to define any variable and its set function with `React.useState`. As soon as the `Reprox.Store.inputValue` value in the example changes, the values of both the elements `<input>` and `<span>` will be seted.

---

## Store Management
You don't need to define anything to create a store with Reprox. If you type `Reprox.{Storename}`, your store object will be defined automatically with the name you specified (an object of Javascript proxy type is created). In the example above, a store named `MainStore` was defined by typing `Reprox.MainStore`. In repetitive spelling, the first code provides the creation of the store. The store object created in subsequent calls will come. You can use all the options provided by the javascript language as the name.
`Reprox.MainStore`
`Reprox["my store"]`
`Reprox["123"]`

You can use the store object you create anywhere in your project, regardless of page and component. All stores that match the name will represent the same object.

#### Data Management and Transport
You can attach the property with the name you want to the store you create. You can then call and use this data on any page or component. In the example above, in the code `Reprox.MainStore.inputValue`, the property named `inputValue` is automatically defined to the `MainStore` store. The type of this feature can be any type, thanks to its Javascript flexibility. When you change the value of this property, all elements that use this property will be re-rendered without requiring you to do anything. (The set functions in the `React.useState` examples will not need to be called.)

#### Permanent Data Retention with Local Storage
###### Reprox.addPersistantStore(params)
You can keep the stores  permanently in the browser Local Storage. You can use the `Reprox.addPersistantStore (params)` function for this. The params parameter can be used in different ways.

```javascript
Reprox.addPersistantStore("FirstStore"); //Store that named FirstStore adding to local storage 
Reprox.addPersistantStore("FirstStore","SecondStore"); //Stores (FirstStore and SecondStore) adding to local storage
Reprox.addPersistantStore(Reprox.FirstStore);// same with first line
Reprox.addPersistantStore(Reprox.FirstStore,"SecondStore");// same with second line
```

###### Reprox.removePersistantStore(params)
You can use the `Reprox.removePersistantStore(params)` function to remove the permanent feature of the stores you have added permanently. The `params` parameter takes the same values as the parameter in the `addPersistantStore` function. 

###### Reprox.initializeStore(store, initial, force)
When the store is set permanently, the data is uploaded from Local Storage to the store when your project first runs. Apart from that, you can use the `Reprox.initializeStore (store, initial, force)` function to initialize the store. Parameters
* **store:** Store name or store object. `Reprox.initializeStore("mystore",... or Reprox.initializeStore(Reprox.mystore,...`
* **initial:** If the store is not permanently set, the initial value that is desired to be given
* **force:** When `true`, the store is set permanently, but it sets the value given by the initial parameter to the store.

#### Objects & Arrays
You can add object-type properties to Reprox stores. The elements using the properties of these objects will be automatically rendered by changing the values of these properties. Here the depth of the nested objects will not matter.
```javascript
<div>
    <input value={Reprox.MainStore.AnyObject.SubObject.inputValue} 
    onChange={(event)=> Reprox.MainStore.AnyObject.SubObject.inputValue = event.target.value}>
    </input>
    <span>{"you are writing: " + Reprox.MainStore.Reprox.MainStore.AnyObject.SubObject.inputValue}</span>
</div>
```    

<details>
<summary><strong>Automatic object and array creation with $ sign</strong></summary>

`Reprox.MainStore.AnyObject.SubObject` this code will return an error if the `AnyObject` property is not defined in this example. For this, Javascript provides error free progression with `?` sign. (`Reprox.mainstore.anyobject?.Subobject`). However, if you want the `AnyObject`  property to always return an object, Reprox will provide you with a convenience. You can do this by adding the `$` sign at the end of the properties you want to be precisely defined in your store or sub-objects.
```javascript
<div>
    <input value={Reprox.MainStore.AnyObject$.SubObject$.inputValue} 
    onChange={(event)=> Reprox.MainStore.AnyObject$.SubObject$.inputValue = event.target.value}>
    </input>
    <span>{"you are writing: " + Reprox.MainStore.Reprox.MainStore.AnyObject$.SubObject$.inputValue}</span>
</div>
``` 
In the above code, if the object `Reprox.MainStore.AnyObject$` was first called, if a property named `AnyObject` has not been previously defined under the MainStore store, the object will be automatically created and assigned to the 'AnyObject' property. Thus, you will not have to deal with the defination of the objects in your store. Again in this example, you do not need to check its definition with the `$` sign at the end of the `SubObject` under the `AnyObject` object. Just add `$` to the first call according to the code order. You can also add `$` in your next calls to Reprox.MainStore.AnyObject

You can use `$$` to create an automatic array. The usage pattern is the same as `$` used for objects.

```javascript
<div>
    <input value={Reprox.MainStore.AnyObject$.SubObject$.inputValue} 
    onChange={(event)=> Reprox.MainStore.AnyObject.SubObject.inputValue = event.target.value}>
    </input>
    <button onClick={()=>Reprox.MainStore.AnyArray.add({name:Reprox.MainStore.AnyObject.SubObject.inputValue})}>
    <ul>
    {Reprox.MainStore.AnyArray$$.map(e=> <li>{e.name}</li>)}
    </ul>
</div>
``` 
</details>


<details>
<summary><strong>Conversion of predefined objects to Javascript Proxy</strong></summary>

Javascript Proxy structure must be used in order to use Reprox features. Therefore, all objects created with Reprox or assigned to the properties of Reprox stores are automatically converted to the Javascript Proxy object. This requires careful use of predefined object variables when writing.
```javascript
var personInfo = {
    name: "name",
    surname: "surname",
    age: new Date()
}

Reprox.AccountStore.PersonInfo = personInfo;
//Reprox.AccountStore.PersonInfo is proxy of personInfo object

var isEqual = Reprox.AccountStore.PersonInfo == personInfo; // false

export default ()=>{
    Reprox.useState("sample5");
    return(
        <div>
            <div>{/*use local variable*/}
                <span>{personInfo.name}</span>
                <span>{personInfo.surname}</span>
                <span>{personInfo.age.toLocaleDateString()}</span>
            </div>
            <div>{/*use local variable*/}
                <span>{Reprox.AccountStore.PersonInfo.name}</span>
                <span>{Reprox.AccountStore.PersonInfo.surname}</span>
                <span>{Reprox.AccountStore.PersonInfo.age.toLocaleDateString()}</span>
            </div>
        </div>
    )
}
```
Although the `personInfo` variable property is assigned in the above example, it will not be the same as` Reprox.AccountStore.PersonInfo`. According to this example, the following situations will occur:
```javascript
personInfo.name = "new name"; //nothing will happen
Reprox.AccountStore.PersonInfo.name = "new name"; //the second div will change, React hooks render process call export function and proxy object changes personInfo object property. So the first div will change too. But when divs are in different pages this will not happen.
```
Because of this situation, all objects that can be used with elements and that may change should be used with Reprox.

A more detailed example:
```javascript
var personInfo = {
    name: "name",
    surname: "surname",
    age: new Date(),
    address:{
        city:"city",
        street:"street",
        zipcode:123,
        phones:[
            {type:"gsm",number:"123456789"},
            {type:"work",number:"123456789"}
        ]        
    }
}

Reprox.AccountStore.PersonInfo = personInfo;
/* After this assign the object will be like this
Reprox.AccountStore.PersonInfo = proxy({
    name: "name",
    surname: "surname",
    age: new Date(),
    address: proxy({
        city:"city",
        street:"street",
        zipcode:123,
        phones:[
            proxy({type:"gsm",number:"123456789"}),
            proxy({type:"work",number:"123456789"})
        ]        
    })
})
*/
```
As seen in this example, when the object is assigned to any property in the Reprox store, it and all its child object properties are automatically converted to a proxy object. Again, objects in the array are converted to proxy objects. This will need to be taken into account when developing the code.

</details>

<details>
<summary><strong>Array Functions</strong></summary>

Reprox has expanded the Javascript Array prototype to capture changes such as additions and subtractions. New functions have been added for this. You can use these functions in any array.

* **add(item, nofire):** Used to add items to the array. Failure to trigger the "nofire" parameter, "watch" and "bind" events can be sent true. 
* **addMany(items, nofire):** It is used to add more than one item to the array. The **items** parameter can be either an array or a single item.
* **remove(item, nofire):** Used to delete item from the array.
* **removeAt(index, nofire):** Enables the element in the index specified by the index parameter to be deleted from the array.
* **removeMany(itemsOrFunc, nofire):** Allows multiple elements to be deleted from the array. 
**itemsOrFunc** can be a single element, array, or condition function.
* **clear(nofire):** Allows all elements in the array to be deleted.
* **equalize(source):** Synchronizes the array to the array given in the source parameter.

</details>

---

## Watch Object Property Changes

Reprox nesnelerin özelliklerinde yapılan değişikleri izleminiz sağlar.  
