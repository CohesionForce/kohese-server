/**
 */
package TestModel;


/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>Special Item</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link TestModel.SpecialItem#getValue <em>Value</em>}</li>
 * </ul>
 *
 * @see TestModel.TestModelPackage#getSpecialItem()
 * @model
 * @generated
 */
public interface SpecialItem extends Item {
	/**
	 * Returns the value of the '<em><b>Value</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <p>
	 * If the meaning of the '<em>Value</em>' attribute isn't clear,
	 * there really should be more of a description here...
	 * </p>
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Value</em>' attribute.
	 * @see #setValue(int)
	 * @see TestModel.TestModelPackage#getSpecialItem_Value()
	 * @model
	 * @generated
	 */
	int getValue();

	/**
	 * Sets the value of the '{@link TestModel.SpecialItem#getValue <em>Value</em>}' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @param value the new value of the '<em>Value</em>' attribute.
	 * @see #getValue()
	 * @generated
	 */
	void setValue(int value);

} // SpecialItem
