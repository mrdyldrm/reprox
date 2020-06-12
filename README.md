# Reprox
React easy state management tiny library

## Defination

It is a small library for React state and store management. It uses the React Hook structure and it must be used in React functional compenents. 

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

## Installation
`npm install reprox`

or  

`yarn add reprox`

## State Management

Reprox React komponentlerin state yönetimini, komponentler ve sayfalar arasında veri taşımayı kolayca yapmanızı sağlar. Bunun için yapmanız gereken aşağıdaki örnekte olduğu gibi js kodunuza Reprox eklemek ve fonksiyonel komponentin içerisine `Reprox.useState(key)` eklemek.

```javascript
import React from 'react';
import Reprox from 'reprox'

export default ()=>{
    Reprox.useSate("unique key");

    retrurn
    (<div>
        <input value={Reprox.MainStore.inputValue} 
        onChange={(event)=> Reprox.MainStore.inputValue = event.target.value}>
        </input>
        <span>{"you are writing: " + Reprox.MainStore.inputValue}</span>
    </div>)
}
```

Yukarıdaki örnek kod en temel şekliyle Reprox kullanımı göstermektedir. Burada `React.useState` kullanarak herhangi bir değişken ve onun set fonksiyonunu tanımlamanız gerekmez. Örnekteki `Reprox.Store.inputValue` değeri değiştiği anda hem `<input>` hem de `<span>` elementlerinin değerleri set edilir. 

## Store Management

Reprox ile mağaza oluşturmak için herhangi bir tanımlama yapmanız gerekmez. `Reprox.{storename}` yazmanız halinde otomatik olarak belirttiğiniz isim ile mağaza nesneniz tanımlanacaktır.(Javascript proxy türünde bir nesne oluşturulur) Yukarıdaki örnekte `Reprox.MainStore` yazılarak `MainStore` isminde bir mağaza tanımlanmıştır. Tekrar eden yazımlarda ilk sıradaki kod mağazanın oluşturulmasını sağlar. Sonraki gelen çağırmalarda oluşturulan mağaza nesnesi gelecektir. İsim olarak javascript dilinin sağladığı tüm seçenekleri kullanabilirsiniz
`Reprox.MainStore`
`Reprox["my store"]`
`Reprox["123"]`

Oluşturduğunuz mağaza nesnesini sayfa ve komponent bağımsız olarak projenizin herhangi bir yerinde kullanabilirsiniz. İsim ile eşleşen tüm mağazalar aynı nesneyi temsil edecektir.

#### Veri Yönetimi ve Taşınması
Oluşturduğunuz mağazaya istediğiniz isimde özellik ile veri iliştirebilirsiniz. Daha sonra bu veriyi sayfa ve komponent bağımsız olarak çağırıp kullanabilirsiniz. Yukarıdaki örnekte `Reprox.MainStore.inputValue` kodunda `inputValue` ismindeki özellik `MainStore` mağazasına otomatik olarak tanımlanmıştır. Bu özelliğin türü Javascript esnekliği sayesinde herhangi bir tür olabilir. Bu özelliğin değerini değiştirdiğinizde, bu özelliğin kullanıldığı tüm elementler hiçbir şey yapmanızı gerektirmeden yeniden render edilecektir. (`React.useState` örneklerindeki set fonksiyonlarının çağrılması gerekmeyecektir.)

#### Local Storage ile Kalıcı Veri Tutma
###### Reprox.addPersistantStore(params)
Oluşturduğunuz mağazanın browser Local Storage'ında kalıcı olarak tutulmasını sağlayabilirsiniz. Bunun için `Reprox.addPersistantStore(params)` fonksiyonunu kullanabilirsiniz. params parametresi farklı şekillerde kullanılabilir.

```javascript
Reprox.addPersistantStore("FirstStore"); //Store that named FirstStore adding to local storage 
Reprox.addPersistantStore("FirstStore","SecondStore"); //Stores (FirstStore and SecondStore) adding to local storage
Reprox.addPersistantStore(Reprox.FirstStore);// same with first line
Reprox.addPersistantStore(Reprox.FirstStore,"SecondStore");// same with second line
````

###### Reprox.removePersistantStore(params)
Önceden kalıcı olarak eklediğiniz mağazaların kalıcı özelliğini kaldırmak için `Reprox.removePersistantStore(params)` fonksiyonunu kullanabilirsiniz. `params` parametresi  `addPersistantStore` fonksiyonundaki parametre ile aynı değerleri alır.

###### Reprox.initializeStore(store, initial, force)
Kalıcı olarak ayarlanan mağaza projeniz ilk çalıştığı zaman veri Local Storage'dan mağazaya yüklenir. Bunun dışında mağazayı initialize etmek için `Reprox.initializeStore(store, initial, force)` fonksiyonunu kullanabilirsiniz. Parametreler
* **store:** Mağaza adı yada mağaza nesnesi. `Reprox.initializeStore("mystore",... or Reprox.initializeStore(Reprox.mystore,...`
* **initial:**  Mağaza kalıcı olarak ayarlanmadıysa verilmek istenen başlangıç değeri
* **force:** `true` verildiği zaman mağaza kalıcı olarak ayarlansa da initial parametresi ile verilen değeri mağazaya set eder.

#### Objects & Arrays
Reprox mağazalarına nesne türünde özellik ekleyebilirsiniz. Bu nesnelerin özelliklerinin kullanıldığı elementler, bu özelleklerin değerlerinin değişmesi ile yine otomatik olarak render edileceklerdir. Burada iç içe nesnelerin derinliği farketmiyecektir. 
```javascript
<div>
    <input value={Reprox.MainStore.AnyObject.SubObject.inputValue} 
    onChange={(event)=> Reprox.MainStore.AnyObject.SubObject.inputValue = event.target.value}>
    </input>
    <span>{"you are writing: " + Reprox.MainStore.Reprox.MainStore.AnyObject.SubObject.inputValue}</span>
</div>
```    

<details>
<summary><strong>$ işareti ile otomatik nesne ve dizi oluşturma</strong></summary>

`Reprox.MainStore.AnyObject.SubObject` bu örnekte `AnyObject` özelliği tanımlanmadıysa bu kod hata dönecektir. Javascript bunun için `?` işareti ile hatasız ilerlemeyi sağlamaktadır. (`Reprox.MainStore.AnyObject?.SubObject`). Ancak `AnyObject` özelliğinin her zaman bir nesne dönmesini istiyorsanız Reprox size bir kolaylık sağlayacaktır. Mağazanızda ya da alt nesnelerde kesin tanımlı olmasını istediğiniz özelliklerin sonuna `$` işareti ekleyerek bunu sağlayabilirsiniz. 
```javascript
<div>
    <input value={Reprox.MainStore.AnyObject$.SubObject$.inputValue} 
    onChange={(event)=> Reprox.MainStore.AnyObject$.SubObject$.inputValue = event.target.value}>
    </input>
    <span>{"you are writing: " + Reprox.MainStore.Reprox.MainStore.AnyObject$.SubObject$.inputValue}</span>
</div>
``` 
Yukarıdaki kod parçasında `Reprox.MainStore.AnyObject$` ilk çağrıldığı yerde eğer daha önce MainStore mağazasının altında `AnyObject` isminde bir özellik tanımlanmadıysa otomatik olarak `AnyObject` özelliğine nesne oluşturulup atanacaktır. Böylece mağazanızdaki nesnelerin tanımlanması ile uğraşmanız gerekmeyecektir. Yine bu örnekte `AnyObject` nesnesi altındaki `SubObject` sonuna eklenen `$` işareti ile onun da tanımlanmasını kontrol etmeniz gerekmiyectir. Kod sırasına göre ilk çağrılacak yere `$` eklemeniz yetecektir. Sonraki `Reprox.MainStore.AnyObject` çağırmalarınzda `$` eklemesiniz de olur. 

Otomatik nesne oluşturmak için `$` kullanabileceğiniz gibi otomtaik array oluşturmak için `$$` kullanabilirsiniz.

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
<summary><strong>Önceden tanımlı nesnelerin Javascript Proxy'e dönüşümü</strong></summary>

Reprox özelliklerinin kullanılabilmesi için Javascript Proxy yapısının kullanılması gerekmektedir. Bu yüzden Reprox ile oluşturulan yada Reprox mağazalarının özelliklerine atanan tüm nesneler otomatik olarak Javascript Proxy nesnesine dönüştürülür. Bu durum yazım sırasında önceden tanımlı nesne değişkenlerinin kullanımda dikkat edilmesini gerektirir
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
Yukarıdaki örnekte `personInfo` değişkeni özelliği atandığı halde `Reprox.AccountStore.PersonInfo` ile aynı olmayacaktır. Bu örneğe göre aşağıdaki durumlar oluşacaktır:
```javascript
personInfo.name = "new name"; //nothing will happen
Reprox.AccountStore.PersonInfo.name = "new name"; //the second div will change, React hooks render process call export function and proxy object changes personInfo object property. So the first div will change too. But when divs are in different pages this will not happen.
```
Bu durumdan dolayı elementler ile kullanılacak ve değişme ihtimali olan tüm nesneler Reprox ile kullanılmalıdır.

Buna daha detaylı bir örnek:
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
Bu örnekte görüleceği üzere object Reprox mağazasındaki herhangi bir özelliğe atandığında kendisi ve tüm alt nesne özellikleri otomatik olarak proxy nesnesine dönüştürülür. Yine dizi içindeki objeler de proxy nesnesine dönüştürülür. Kod geliştirilirken bu durumun dikkate alınması gerekecektir. 

</details>

<details>
<summary><strong>Array Fonksiyonları</strong></summary>

Dizilerde ekleme,çıkartma gibi değişiklikleri yakalayabilmek için Reprox Javascript Array prototipini genişletmiştir. Bunun için yeni fonksiyonlar eklenmiştir. Bu fonksiyonları herhangi bir dizide kullanabilirsiniz.

**add(item, nofire):** Diziye item eklemek için kullanılır. `nofire` parametresi "watch" ve "bind" eventlerinin tetiklenmemesi true gönderilebilir. 
**addMany(items, nofire):** Diziye birden fazla item eklemek için kullanılır. items parametresi dizi olabileceği gibi tek bir item da olabilir.
**remove(item, nofire):** Diziden item silmek için kullanılır.
**removeAt(index, nofire):** Diziden index parametresi ile belirtilen indeksteki elemanın silinmesini sağlar.
**removeMany(itemsOrFunc, nofire):** Diziden birden fazla elemanın silinmesini sağlar. itemsOrFunc tek eleman, dizi, yada koşul fonksiyonu olabilir.
**clear(nofire):** Dizideki tüm elemanların silinmesini sağlar.
**equalize(source):** Diziyi source paramatresinde verilen diziye göre eşitler.

</details>

## Watch Object Property Changes

