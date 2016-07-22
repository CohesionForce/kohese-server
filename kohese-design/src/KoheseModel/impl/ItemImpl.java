/**
 */
package KoheseModel.impl;

import KoheseModel.Item;
import KoheseModel.Journal;
import KoheseModel.KoheseModelPackage;
import KoheseModel.Workflow;

import java.util.Collection;

import org.eclipse.emf.common.notify.Notification;
import org.eclipse.emf.common.notify.NotificationChain;

import org.eclipse.emf.common.util.EList;

import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.InternalEObject;

import org.eclipse.emf.ecore.impl.ENotificationImpl;
import org.eclipse.emf.ecore.impl.MinimalEObjectImpl;

import org.eclipse.emf.ecore.util.EObjectContainmentEList;
import org.eclipse.emf.ecore.util.EObjectResolvingEList;
import org.eclipse.emf.ecore.util.InternalEList;

/**
 * <!-- begin-user-doc -->
 * An implementation of the model object '<em><b>Item</b></em>'.
 * <!-- end-user-doc -->
 * <p>
 * The following features are implemented:
 * </p>
 * <ul>
 *   <li>{@link KoheseModel.impl.ItemImpl#getJournal <em>Journal</em>}</li>
 *   <li>{@link KoheseModel.impl.ItemImpl#getChild <em>Child</em>}</li>
 *   <li>{@link KoheseModel.impl.ItemImpl#getWorkflow <em>Workflow</em>}</li>
 *   <li>{@link KoheseModel.impl.ItemImpl#getName <em>Name</em>}</li>
 *   <li>{@link KoheseModel.impl.ItemImpl#getId <em>Id</em>}</li>
 *   <li>{@link KoheseModel.impl.ItemImpl#getChild2 <em>Child2</em>}</li>
 * </ul>
 *
 * @generated
 */
public class ItemImpl extends MinimalEObjectImpl.Container implements Item {
	/**
	 * The cached value of the '{@link #getJournal() <em>Journal</em>}' containment reference.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getJournal()
	 * @generated
	 * @ordered
	 */
	protected Journal journal;

	/**
	 * The cached value of the '{@link #getChild() <em>Child</em>}' containment reference list.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getChild()
	 * @generated
	 * @ordered
	 */
	protected EList<Item> child;

	/**
	 * The cached value of the '{@link #getWorkflow() <em>Workflow</em>}' containment reference list.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getWorkflow()
	 * @generated
	 * @ordered
	 */
	protected EList<Workflow> workflow;

	/**
	 * The default value of the '{@link #getName() <em>Name</em>}' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getName()
	 * @generated
	 * @ordered
	 */
	protected static final String NAME_EDEFAULT = null;

	/**
	 * The cached value of the '{@link #getName() <em>Name</em>}' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getName()
	 * @generated
	 * @ordered
	 */
	protected String name = NAME_EDEFAULT;

	/**
	 * The default value of the '{@link #getId() <em>Id</em>}' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getId()
	 * @generated
	 * @ordered
	 */
	protected static final String ID_EDEFAULT = null;

	/**
	 * The cached value of the '{@link #getId() <em>Id</em>}' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getId()
	 * @generated
	 * @ordered
	 */
	protected String id = ID_EDEFAULT;

	/**
	 * The cached value of the '{@link #getChild2() <em>Child2</em>}' reference list.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getChild2()
	 * @generated
	 * @ordered
	 */
	protected EList<Item> child2;

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	protected ItemImpl() {
		super();
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	protected EClass eStaticClass() {
		return KoheseModelPackage.Literals.ITEM;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public Journal getJournal() {
		return journal;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public NotificationChain basicSetJournal(Journal newJournal, NotificationChain msgs) {
		Journal oldJournal = journal;
		journal = newJournal;
		if (eNotificationRequired()) {
			ENotificationImpl notification = new ENotificationImpl(this, Notification.SET, KoheseModelPackage.ITEM__JOURNAL, oldJournal, newJournal);
			if (msgs == null) msgs = notification; else msgs.add(notification);
		}
		return msgs;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public void setJournal(Journal newJournal) {
		if (newJournal != journal) {
			NotificationChain msgs = null;
			if (journal != null)
				msgs = ((InternalEObject)journal).eInverseRemove(this, EOPPOSITE_FEATURE_BASE - KoheseModelPackage.ITEM__JOURNAL, null, msgs);
			if (newJournal != null)
				msgs = ((InternalEObject)newJournal).eInverseAdd(this, EOPPOSITE_FEATURE_BASE - KoheseModelPackage.ITEM__JOURNAL, null, msgs);
			msgs = basicSetJournal(newJournal, msgs);
			if (msgs != null) msgs.dispatch();
		}
		else if (eNotificationRequired())
			eNotify(new ENotificationImpl(this, Notification.SET, KoheseModelPackage.ITEM__JOURNAL, newJournal, newJournal));
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public EList<Item> getChild() {
		if (child == null) {
			child = new EObjectContainmentEList<Item>(Item.class, this, KoheseModelPackage.ITEM__CHILD);
		}
		return child;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public EList<Workflow> getWorkflow() {
		if (workflow == null) {
			workflow = new EObjectContainmentEList<Workflow>(Workflow.class, this, KoheseModelPackage.ITEM__WORKFLOW);
		}
		return workflow;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public String getName() {
		return name;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public void setName(String newName) {
		String oldName = name;
		name = newName;
		if (eNotificationRequired())
			eNotify(new ENotificationImpl(this, Notification.SET, KoheseModelPackage.ITEM__NAME, oldName, name));
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public String getId() {
		return id;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public void setId(String newId) {
		String oldId = id;
		id = newId;
		if (eNotificationRequired())
			eNotify(new ENotificationImpl(this, Notification.SET, KoheseModelPackage.ITEM__ID, oldId, id));
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public EList<Item> getChild2() {
		if (child2 == null) {
			child2 = new EObjectResolvingEList<Item>(Item.class, this, KoheseModelPackage.ITEM__CHILD2);
		}
		return child2;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public NotificationChain eInverseRemove(InternalEObject otherEnd, int featureID, NotificationChain msgs) {
		switch (featureID) {
			case KoheseModelPackage.ITEM__JOURNAL:
				return basicSetJournal(null, msgs);
			case KoheseModelPackage.ITEM__CHILD:
				return ((InternalEList<?>)getChild()).basicRemove(otherEnd, msgs);
			case KoheseModelPackage.ITEM__WORKFLOW:
				return ((InternalEList<?>)getWorkflow()).basicRemove(otherEnd, msgs);
		}
		return super.eInverseRemove(otherEnd, featureID, msgs);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public Object eGet(int featureID, boolean resolve, boolean coreType) {
		switch (featureID) {
			case KoheseModelPackage.ITEM__JOURNAL:
				return getJournal();
			case KoheseModelPackage.ITEM__CHILD:
				return getChild();
			case KoheseModelPackage.ITEM__WORKFLOW:
				return getWorkflow();
			case KoheseModelPackage.ITEM__NAME:
				return getName();
			case KoheseModelPackage.ITEM__ID:
				return getId();
			case KoheseModelPackage.ITEM__CHILD2:
				return getChild2();
		}
		return super.eGet(featureID, resolve, coreType);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@SuppressWarnings("unchecked")
	@Override
	public void eSet(int featureID, Object newValue) {
		switch (featureID) {
			case KoheseModelPackage.ITEM__JOURNAL:
				setJournal((Journal)newValue);
				return;
			case KoheseModelPackage.ITEM__CHILD:
				getChild().clear();
				getChild().addAll((Collection<? extends Item>)newValue);
				return;
			case KoheseModelPackage.ITEM__WORKFLOW:
				getWorkflow().clear();
				getWorkflow().addAll((Collection<? extends Workflow>)newValue);
				return;
			case KoheseModelPackage.ITEM__NAME:
				setName((String)newValue);
				return;
			case KoheseModelPackage.ITEM__ID:
				setId((String)newValue);
				return;
			case KoheseModelPackage.ITEM__CHILD2:
				getChild2().clear();
				getChild2().addAll((Collection<? extends Item>)newValue);
				return;
		}
		super.eSet(featureID, newValue);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public void eUnset(int featureID) {
		switch (featureID) {
			case KoheseModelPackage.ITEM__JOURNAL:
				setJournal((Journal)null);
				return;
			case KoheseModelPackage.ITEM__CHILD:
				getChild().clear();
				return;
			case KoheseModelPackage.ITEM__WORKFLOW:
				getWorkflow().clear();
				return;
			case KoheseModelPackage.ITEM__NAME:
				setName(NAME_EDEFAULT);
				return;
			case KoheseModelPackage.ITEM__ID:
				setId(ID_EDEFAULT);
				return;
			case KoheseModelPackage.ITEM__CHILD2:
				getChild2().clear();
				return;
		}
		super.eUnset(featureID);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public boolean eIsSet(int featureID) {
		switch (featureID) {
			case KoheseModelPackage.ITEM__JOURNAL:
				return journal != null;
			case KoheseModelPackage.ITEM__CHILD:
				return child != null && !child.isEmpty();
			case KoheseModelPackage.ITEM__WORKFLOW:
				return workflow != null && !workflow.isEmpty();
			case KoheseModelPackage.ITEM__NAME:
				return NAME_EDEFAULT == null ? name != null : !NAME_EDEFAULT.equals(name);
			case KoheseModelPackage.ITEM__ID:
				return ID_EDEFAULT == null ? id != null : !ID_EDEFAULT.equals(id);
			case KoheseModelPackage.ITEM__CHILD2:
				return child2 != null && !child2.isEmpty();
		}
		return super.eIsSet(featureID);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public String toString() {
		if (eIsProxy()) return super.toString();

		StringBuffer result = new StringBuffer(super.toString());
		result.append(" (name: ");
		result.append(name);
		result.append(", id: ");
		result.append(id);
		result.append(')');
		return result.toString();
	}

} //ItemImpl
