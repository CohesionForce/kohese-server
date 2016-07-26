/**
 */
package TestModel;

import org.eclipse.emf.ecore.EAttribute;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EReference;

/**
 * <!-- begin-user-doc -->
 * The <b>Package</b> for the model.
 * It contains accessors for the meta objects to represent
 * <ul>
 *   <li>each class,</li>
 *   <li>each feature of each class,</li>
 *   <li>each operation of each class,</li>
 *   <li>each enum,</li>
 *   <li>and each data type</li>
 * </ul>
 * <!-- end-user-doc -->
 * @see TestModel.TestModelFactory
 * @model kind="package"
 * @generated
 */
public interface TestModelPackage extends EPackage {
	/**
	 * The package name.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	String eNAME = "TestModel";

	/**
	 * The package namespace URI.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	String eNS_URI = "http://www.example.org/TestModel";

	/**
	 * The package namespace name.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	String eNS_PREFIX = "TestModel";

	/**
	 * The singleton instance of the package.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	TestModelPackage eINSTANCE = TestModel.impl.TestModelPackageImpl.init();

	/**
	 * The meta object id for the '{@link TestModel.impl.ItemImpl <em>Item</em>}' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see TestModel.impl.ItemImpl
	 * @see TestModel.impl.TestModelPackageImpl#getItem()
	 * @generated
	 */
	int ITEM = 0;

	/**
	 * The feature id for the '<em><b>Child</b></em>' containment reference list.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int ITEM__CHILD = 0;

	/**
	 * The feature id for the '<em><b>Name</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int ITEM__NAME = 1;

	/**
	 * The number of structural features of the '<em>Item</em>' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int ITEM_FEATURE_COUNT = 2;

	/**
	 * The number of operations of the '<em>Item</em>' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int ITEM_OPERATION_COUNT = 0;


	/**
	 * The meta object id for the '{@link TestModel.impl.SpecialItemImpl <em>Special Item</em>}' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see TestModel.impl.SpecialItemImpl
	 * @see TestModel.impl.TestModelPackageImpl#getSpecialItem()
	 * @generated
	 */
	int SPECIAL_ITEM = 1;

	/**
	 * The feature id for the '<em><b>Child</b></em>' containment reference list.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int SPECIAL_ITEM__CHILD = ITEM__CHILD;

	/**
	 * The feature id for the '<em><b>Name</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int SPECIAL_ITEM__NAME = ITEM__NAME;

	/**
	 * The feature id for the '<em><b>Value</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int SPECIAL_ITEM__VALUE = ITEM_FEATURE_COUNT + 0;

	/**
	 * The number of structural features of the '<em>Special Item</em>' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int SPECIAL_ITEM_FEATURE_COUNT = ITEM_FEATURE_COUNT + 1;

	/**
	 * The number of operations of the '<em>Special Item</em>' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int SPECIAL_ITEM_OPERATION_COUNT = ITEM_OPERATION_COUNT + 0;

	/**
	 * The meta object id for the '{@link TestModel.impl.AnotherItemImpl <em>Another Item</em>}' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see TestModel.impl.AnotherItemImpl
	 * @see TestModel.impl.TestModelPackageImpl#getAnotherItem()
	 * @generated
	 */
	int ANOTHER_ITEM = 2;

	/**
	 * The feature id for the '<em><b>Child</b></em>' containment reference list.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int ANOTHER_ITEM__CHILD = ITEM__CHILD;

	/**
	 * The feature id for the '<em><b>Name</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int ANOTHER_ITEM__NAME = ITEM__NAME;

	/**
	 * The feature id for the '<em><b>Test</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int ANOTHER_ITEM__TEST = ITEM_FEATURE_COUNT + 0;

	/**
	 * The number of structural features of the '<em>Another Item</em>' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int ANOTHER_ITEM_FEATURE_COUNT = ITEM_FEATURE_COUNT + 1;

	/**
	 * The number of operations of the '<em>Another Item</em>' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int ANOTHER_ITEM_OPERATION_COUNT = ITEM_OPERATION_COUNT + 0;


	/**
	 * The meta object id for the '{@link TestModel.impl.SimpleImpl <em>Simple</em>}' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see TestModel.impl.SimpleImpl
	 * @see TestModel.impl.TestModelPackageImpl#getSimple()
	 * @generated
	 */
	int SIMPLE = 3;

	/**
	 * The feature id for the '<em><b>Name</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int SIMPLE__NAME = 0;

	/**
	 * The feature id for the '<em><b>Info</b></em>' containment reference list.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int SIMPLE__INFO = 1;

	/**
	 * The number of structural features of the '<em>Simple</em>' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int SIMPLE_FEATURE_COUNT = 2;

	/**
	 * The number of operations of the '<em>Simple</em>' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int SIMPLE_OPERATION_COUNT = 0;

	/**
	 * The meta object id for the '{@link TestModel.impl.InfoImpl <em>Info</em>}' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see TestModel.impl.InfoImpl
	 * @see TestModel.impl.TestModelPackageImpl#getInfo()
	 * @generated
	 */
	int INFO = 4;

	/**
	 * The feature id for the '<em><b>Value</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int INFO__VALUE = 0;

	/**
	 * The feature id for the '<em><b>Sub Info</b></em>' containment reference list.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int INFO__SUB_INFO = 1;

	/**
	 * The feature id for the '<em><b>Name</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int INFO__NAME = 2;

	/**
	 * The number of structural features of the '<em>Info</em>' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int INFO_FEATURE_COUNT = 3;

	/**
	 * The number of operations of the '<em>Info</em>' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int INFO_OPERATION_COUNT = 0;

	/**
	 * The meta object id for the '{@link TestModel.impl.SubordinateInfoImpl <em>Subordinate Info</em>}' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see TestModel.impl.SubordinateInfoImpl
	 * @see TestModel.impl.TestModelPackageImpl#getSubordinateInfo()
	 * @generated
	 */
	int SUBORDINATE_INFO = 5;

	/**
	 * The feature id for the '<em><b>Test</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int SUBORDINATE_INFO__TEST = 0;

	/**
	 * The feature id for the '<em><b>Name</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int SUBORDINATE_INFO__NAME = 1;

	/**
	 * The number of structural features of the '<em>Subordinate Info</em>' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int SUBORDINATE_INFO_FEATURE_COUNT = 2;

	/**
	 * The number of operations of the '<em>Subordinate Info</em>' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int SUBORDINATE_INFO_OPERATION_COUNT = 0;


	/**
	 * Returns the meta object for class '{@link TestModel.Item <em>Item</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for class '<em>Item</em>'.
	 * @see TestModel.Item
	 * @generated
	 */
	EClass getItem();

	/**
	 * Returns the meta object for the containment reference list '{@link TestModel.Item#getChild <em>Child</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for the containment reference list '<em>Child</em>'.
	 * @see TestModel.Item#getChild()
	 * @see #getItem()
	 * @generated
	 */
	EReference getItem_Child();

	/**
	 * Returns the meta object for the attribute '{@link TestModel.Item#getName <em>Name</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for the attribute '<em>Name</em>'.
	 * @see TestModel.Item#getName()
	 * @see #getItem()
	 * @generated
	 */
	EAttribute getItem_Name();

	/**
	 * Returns the meta object for class '{@link TestModel.SpecialItem <em>Special Item</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for class '<em>Special Item</em>'.
	 * @see TestModel.SpecialItem
	 * @generated
	 */
	EClass getSpecialItem();

	/**
	 * Returns the meta object for the attribute '{@link TestModel.SpecialItem#getValue <em>Value</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for the attribute '<em>Value</em>'.
	 * @see TestModel.SpecialItem#getValue()
	 * @see #getSpecialItem()
	 * @generated
	 */
	EAttribute getSpecialItem_Value();

	/**
	 * Returns the meta object for class '{@link TestModel.AnotherItem <em>Another Item</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for class '<em>Another Item</em>'.
	 * @see TestModel.AnotherItem
	 * @generated
	 */
	EClass getAnotherItem();

	/**
	 * Returns the meta object for the attribute '{@link TestModel.AnotherItem#isTest <em>Test</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for the attribute '<em>Test</em>'.
	 * @see TestModel.AnotherItem#isTest()
	 * @see #getAnotherItem()
	 * @generated
	 */
	EAttribute getAnotherItem_Test();

	/**
	 * Returns the meta object for class '{@link TestModel.Simple <em>Simple</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for class '<em>Simple</em>'.
	 * @see TestModel.Simple
	 * @generated
	 */
	EClass getSimple();

	/**
	 * Returns the meta object for the attribute '{@link TestModel.Simple#getName <em>Name</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for the attribute '<em>Name</em>'.
	 * @see TestModel.Simple#getName()
	 * @see #getSimple()
	 * @generated
	 */
	EAttribute getSimple_Name();

	/**
	 * Returns the meta object for the containment reference list '{@link TestModel.Simple#getInfo <em>Info</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for the containment reference list '<em>Info</em>'.
	 * @see TestModel.Simple#getInfo()
	 * @see #getSimple()
	 * @generated
	 */
	EReference getSimple_Info();

	/**
	 * Returns the meta object for class '{@link TestModel.Info <em>Info</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for class '<em>Info</em>'.
	 * @see TestModel.Info
	 * @generated
	 */
	EClass getInfo();

	/**
	 * Returns the meta object for the attribute '{@link TestModel.Info#getValue <em>Value</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for the attribute '<em>Value</em>'.
	 * @see TestModel.Info#getValue()
	 * @see #getInfo()
	 * @generated
	 */
	EAttribute getInfo_Value();

	/**
	 * Returns the meta object for the containment reference list '{@link TestModel.Info#getSubInfo <em>Sub Info</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for the containment reference list '<em>Sub Info</em>'.
	 * @see TestModel.Info#getSubInfo()
	 * @see #getInfo()
	 * @generated
	 */
	EReference getInfo_SubInfo();

	/**
	 * Returns the meta object for the attribute '{@link TestModel.Info#getName <em>Name</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for the attribute '<em>Name</em>'.
	 * @see TestModel.Info#getName()
	 * @see #getInfo()
	 * @generated
	 */
	EAttribute getInfo_Name();

	/**
	 * Returns the meta object for class '{@link TestModel.SubordinateInfo <em>Subordinate Info</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for class '<em>Subordinate Info</em>'.
	 * @see TestModel.SubordinateInfo
	 * @generated
	 */
	EClass getSubordinateInfo();

	/**
	 * Returns the meta object for the attribute '{@link TestModel.SubordinateInfo#isTest <em>Test</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for the attribute '<em>Test</em>'.
	 * @see TestModel.SubordinateInfo#isTest()
	 * @see #getSubordinateInfo()
	 * @generated
	 */
	EAttribute getSubordinateInfo_Test();

	/**
	 * Returns the meta object for the attribute '{@link TestModel.SubordinateInfo#getName <em>Name</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for the attribute '<em>Name</em>'.
	 * @see TestModel.SubordinateInfo#getName()
	 * @see #getSubordinateInfo()
	 * @generated
	 */
	EAttribute getSubordinateInfo_Name();

	/**
	 * Returns the factory that creates the instances of the model.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the factory that creates the instances of the model.
	 * @generated
	 */
	TestModelFactory getTestModelFactory();

	/**
	 * <!-- begin-user-doc -->
	 * Defines literals for the meta objects that represent
	 * <ul>
	 *   <li>each class,</li>
	 *   <li>each feature of each class,</li>
	 *   <li>each operation of each class,</li>
	 *   <li>each enum,</li>
	 *   <li>and each data type</li>
	 * </ul>
	 * <!-- end-user-doc -->
	 * @generated
	 */
	interface Literals {
		/**
		 * The meta object literal for the '{@link TestModel.impl.ItemImpl <em>Item</em>}' class.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @see TestModel.impl.ItemImpl
		 * @see TestModel.impl.TestModelPackageImpl#getItem()
		 * @generated
		 */
		EClass ITEM = eINSTANCE.getItem();

		/**
		 * The meta object literal for the '<em><b>Child</b></em>' containment reference list feature.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @generated
		 */
		EReference ITEM__CHILD = eINSTANCE.getItem_Child();

		/**
		 * The meta object literal for the '<em><b>Name</b></em>' attribute feature.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @generated
		 */
		EAttribute ITEM__NAME = eINSTANCE.getItem_Name();

		/**
		 * The meta object literal for the '{@link TestModel.impl.SpecialItemImpl <em>Special Item</em>}' class.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @see TestModel.impl.SpecialItemImpl
		 * @see TestModel.impl.TestModelPackageImpl#getSpecialItem()
		 * @generated
		 */
		EClass SPECIAL_ITEM = eINSTANCE.getSpecialItem();

		/**
		 * The meta object literal for the '<em><b>Value</b></em>' attribute feature.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @generated
		 */
		EAttribute SPECIAL_ITEM__VALUE = eINSTANCE.getSpecialItem_Value();

		/**
		 * The meta object literal for the '{@link TestModel.impl.AnotherItemImpl <em>Another Item</em>}' class.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @see TestModel.impl.AnotherItemImpl
		 * @see TestModel.impl.TestModelPackageImpl#getAnotherItem()
		 * @generated
		 */
		EClass ANOTHER_ITEM = eINSTANCE.getAnotherItem();

		/**
		 * The meta object literal for the '<em><b>Test</b></em>' attribute feature.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @generated
		 */
		EAttribute ANOTHER_ITEM__TEST = eINSTANCE.getAnotherItem_Test();

		/**
		 * The meta object literal for the '{@link TestModel.impl.SimpleImpl <em>Simple</em>}' class.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @see TestModel.impl.SimpleImpl
		 * @see TestModel.impl.TestModelPackageImpl#getSimple()
		 * @generated
		 */
		EClass SIMPLE = eINSTANCE.getSimple();

		/**
		 * The meta object literal for the '<em><b>Name</b></em>' attribute feature.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @generated
		 */
		EAttribute SIMPLE__NAME = eINSTANCE.getSimple_Name();

		/**
		 * The meta object literal for the '<em><b>Info</b></em>' containment reference list feature.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @generated
		 */
		EReference SIMPLE__INFO = eINSTANCE.getSimple_Info();

		/**
		 * The meta object literal for the '{@link TestModel.impl.InfoImpl <em>Info</em>}' class.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @see TestModel.impl.InfoImpl
		 * @see TestModel.impl.TestModelPackageImpl#getInfo()
		 * @generated
		 */
		EClass INFO = eINSTANCE.getInfo();

		/**
		 * The meta object literal for the '<em><b>Value</b></em>' attribute feature.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @generated
		 */
		EAttribute INFO__VALUE = eINSTANCE.getInfo_Value();

		/**
		 * The meta object literal for the '<em><b>Sub Info</b></em>' containment reference list feature.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @generated
		 */
		EReference INFO__SUB_INFO = eINSTANCE.getInfo_SubInfo();

		/**
		 * The meta object literal for the '<em><b>Name</b></em>' attribute feature.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @generated
		 */
		EAttribute INFO__NAME = eINSTANCE.getInfo_Name();

		/**
		 * The meta object literal for the '{@link TestModel.impl.SubordinateInfoImpl <em>Subordinate Info</em>}' class.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @see TestModel.impl.SubordinateInfoImpl
		 * @see TestModel.impl.TestModelPackageImpl#getSubordinateInfo()
		 * @generated
		 */
		EClass SUBORDINATE_INFO = eINSTANCE.getSubordinateInfo();

		/**
		 * The meta object literal for the '<em><b>Test</b></em>' attribute feature.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @generated
		 */
		EAttribute SUBORDINATE_INFO__TEST = eINSTANCE.getSubordinateInfo_Test();

		/**
		 * The meta object literal for the '<em><b>Name</b></em>' attribute feature.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @generated
		 */
		EAttribute SUBORDINATE_INFO__NAME = eINSTANCE.getSubordinateInfo_Name();

	}

} //TestModelPackage
